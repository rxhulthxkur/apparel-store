"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

const AuthContext = createContext();

// Shopify Customer Authentication GraphQL queries
const CUSTOMER_LOGIN_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_REGISTER_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_DETAILS_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      displayName
      phone
      defaultAddress {
        id
        address1
        address2
        city
        province
        country
        zip
        phone
      }
    }
  }
`;

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TOKEN_COOKIE_NAME = 'shopify_customer_token';
  const TOKEN_EXPIRY_DAYS = 30;

  // Shopify Storefront API fetch function
  const shopifyFetch = async ({ query, variables }) => {
    try {
      // Enhanced debug log
      console.log('Shopify API Debug:', {
        domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
        hasToken: !!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        url: `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`,
        environment: process.env.NODE_ENV,
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ? 'Token present' : 'Token missing'
        }
      });

      const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
          },
          body: JSON.stringify({ query, variables })
        }
      );

      // Log response details
      console.log('Shopify API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const { data, errors } = await response.json();
      
      if (errors) {
        console.error('Shopify API Errors:', errors);
        throw new Error(errors[0].message);
      }
      
      return data;
    } catch (error) {
      console.error('Shopify Fetch Error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Load token from localStorage and cookies on client side
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        setLoading(true);
        
        // Try to get token from cookies first (more secure)
        let token = getCookie(TOKEN_COOKIE_NAME);
        
        // If not in cookies, try localStorage as fallback
        if (!token) {
          token = localStorage.getItem(TOKEN_COOKIE_NAME);
          // If found in localStorage, also set in cookies for next time
          if (token) {
            setCookie(TOKEN_COOKIE_NAME, token, { maxAge: 60 * 60 * 24 * TOKEN_EXPIRY_DAYS });
          }
        }
        
        if (token) {
          setAccessToken(token);
          await fetchCustomerDetails(token);
        }
      } catch (error) {
        console.error('Error loading auth:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    loadStoredAuth();
  }, []);

  // Fetch customer details using the access token
  const fetchCustomerDetails = async (token) => {
    if (!token) return;
    
    try {
      const data = await shopifyFetch({
        query: CUSTOMER_DETAILS_QUERY,
        variables: { customerAccessToken: token }
      });
      
      if (data.customer) {
        setCustomer(data.customer);
      } else {
        throw new Error('Customer not found');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      logout();
    }
  };

  // Save auth token to both localStorage and cookies
  const saveAuthToken = (token, expiresAt) => {
    if (!token) return;
    
    // Convert expiresAt to seconds for cookie maxAge
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const maxAge = Math.floor((expiryDate - now) / 1000); // Convert ms to seconds
    
    // Set in both localStorage and cookies
    localStorage.setItem(TOKEN_COOKIE_NAME, token);
    setCookie(TOKEN_COOKIE_NAME, token, { maxAge });
    
    setAccessToken(token);
  };

  // Register a new customer
  const register = async (firstName, lastName, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await shopifyFetch({
        query: CUSTOMER_REGISTER_MUTATION,
        variables: {
          input: {
            firstName,
            lastName,
            email,
            password,
            acceptsMarketing: true
          }
        }
      });
      
      const { customer, customerUserErrors } = data.customerCreate;
      
      if (customerUserErrors.length > 0) {
        throw new Error(customerUserErrors[0].message);
      }
      
      // Automatically log in after successful registration
      return await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await shopifyFetch({
        query: CUSTOMER_LOGIN_MUTATION,
        variables: {
          input: {
            email,
            password,
          }
        }
      });
      
      const { customerAccessToken, customerUserErrors } = data.customerAccessTokenCreate;
      
      if (customerUserErrors.length > 0) {
        throw new Error(customerUserErrors[0].message);
      }
      
      if (!customerAccessToken) {
        throw new Error('Failed to get access token');
      }
      
      // Save token and fetch customer details
      saveAuthToken(customerAccessToken.accessToken, customerAccessToken.expiresAt);
      await fetchCustomerDetails(customerAccessToken.accessToken);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout - clear tokens and customer data
  const logout = () => {
    setAccessToken(null);
    setCustomer(null);
    localStorage.removeItem(TOKEN_COOKIE_NAME);
    deleteCookie(TOKEN_COOKIE_NAME);
  };

  // Check if user is authenticated
  const isAuthenticated = !!accessToken && !!customer;

  return (
    <AuthContext.Provider value={{
      accessToken,
      customer,
      loading,
      error,
      isAuthenticated,
      register,
      login,
      logout,
      fetchCustomerDetails
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 
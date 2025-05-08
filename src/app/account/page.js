"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function AccountPage() {
  const { customer, loading, logout, isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasOrders, setHasOrders] = useState(false);
  const router = useRouter();

  // Check if customer has orders
  useEffect(() => {
    async function checkOrders() {
      if (!isAuthenticated) return;

      try {
        const customerAccessToken = localStorage.getItem('shopify_customer_token');
        if (!customerAccessToken) return;

        const STOREFRONT_API_URL = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
        
        const ordersQuery = `
          query getCustomerOrders($customerAccessToken: String!) {
            customer(customerAccessToken: $customerAccessToken) {
              orders(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        `;

        const response = await fetch(STOREFRONT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
          },
          body: JSON.stringify({
            query: ordersQuery,
            variables: {
              customerAccessToken
            }
          })
        });

        if (!response.ok) return;

        const data = await response.json();
        if (data.errors) return;

        setHasOrders(data.data.customer.orders.edges.length > 0);
      } catch (err) {
        console.error('Error checking orders:', err);
      }
    }

    checkOrders();
  }, [isAuthenticated]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Clear cart to ensure we get a fresh one on next login
    await clearCart();
    
    // Logout the user
    logout();
    
    // Redirect to home page
    router.push('/');
  };

  if (loading || !customer) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Header/Navigation */}
        <nav className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center">
            <Link href="/" className="mr-8">
              <div className="flex items-center justify-center h-12 w-12 bg-white text-black rounded-full font-bold text-xl">
                RT
              </div>
            </Link>
          </div>
        </nav>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header/Navigation */}
      <nav className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center">
          <Link href="/" className="mr-8">
            <div className="flex items-center justify-center h-12 w-12 bg-white text-black rounded-full font-bold text-xl">
              RT
            </div>
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link href="/search" className="text-white hover:text-gray-300">All</Link>
            <Link href="/search/womens-collection" className="text-white hover:text-gray-300">Women</Link>
            <Link href="/search/mens-collection" className="text-white hover:text-gray-300">Men</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto w-full px-4 py-8 flex-1">
        <div className="bg-gray-900 rounded-lg p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl font-bold">My Account</h1>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-4 md:mt-0 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition flex items-center"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Logging out...
                </>
              ) : (
                'Logout'
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p>{customer.firstName} {customer.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p>{customer.email}</p>
                </div>
                {customer.phone && (
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p>{customer.phone}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">Default Address</h2>
              {customer.defaultAddress ? (
                <div className="space-y-2">
                  <p>{customer.defaultAddress.address1}</p>
                  {customer.defaultAddress.address2 && <p>{customer.defaultAddress.address2}</p>}
                  <p>
                    {customer.defaultAddress.city}, {customer.defaultAddress.province} {customer.defaultAddress.zip}
                  </p>
                  <p>{customer.defaultAddress.country}</p>
                </div>
              ) : (
                <p className="text-gray-400">No default address set</p>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">Order History</h2>
            {hasOrders ? (
              <div className="space-y-4">
                <p className="text-gray-400">You have placed orders in the past.</p>
                <Link href="/account/orders">
                  <button className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition">
                    View Order History
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400">You haven't placed any orders yet.</p>
                <Link href="/search">
                  <button className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition">
                    Start Shopping
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
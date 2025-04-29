"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

// Shopify Storefront API GraphQL queries
const CREATE_CART_MUTATION = `
    mutation createCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    id
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADD_TO_CART_MUTATION = `
  mutation addCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    id
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_CART_MUTATION = `
  mutation updateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    id
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const REMOVE_FROM_CART_MUTATION = `
  mutation removeCartLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    id
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  id
                  title
                  handle
                  featuredImage {
                    url
                    altText
                  }
                }
                priceV2 {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Add query to get product variants
const GET_PRODUCT_VARIANTS = `
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      title
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            priceV2 {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

// Helper functions for Shopify ID handling
const isValidShopifyId = (id) => {
  // Check if ID is properly formatted (gid://shopify/ProductVariant/123456)
  return typeof id === 'string' && id.startsWith('gid://shopify/');
};

const decodeShopifyId = (id) => {
  if (!id || !isValidShopifyId(id)) return null;
  
  // Extract the numeric part from the GID
  const matches = id.match(/gid:\/\/shopify\/\w+\/(\d+)/);
  return matches ? matches[1] : null;
};

const createShopifyVariantId = (id) => {
  // If already a valid Shopify ID with ProductVariant, return as is
  if (isValidShopifyId(id) && id.includes('/ProductVariant/')) return id;
  
  // If it's a product ID, we can't directly convert to a variant ID
  // Product variants have their own unique IDs that we need to fetch
  if (isValidShopifyId(id) && id.includes('/Product/')) {
    console.log("Product IDs cannot be directly converted to variant IDs:", id);
    return null;
  }
  
  // If it's a numeric ID or string that can be converted to number
  const numericId = String(id).replace(/\D/g, '');
  if (numericId) {
    return `gid://shopify/ProductVariant/${numericId}`;
  }
  
  return null;
};

// Ensure we have a valid variant ID format
const ensureValidId = (id) => {
  if (!id) return null;
  
  // If already a valid Shopify ID, return as is
  if (isValidShopifyId(id)) {
    return id;
  }
  
  // Try to create a valid Shopify variant ID
  return createShopifyVariantId(id);
};

export function CartProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();
  const [cartId, setCartId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Shopify Storefront API fetch function
  const shopifyFetch = async ({ query, variables }) => {
    try {
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

      const { data, errors } = await response.json();
      
      if (errors) {
        throw new Error(errors[0].message);
      }
      
      return data;
    } catch (error) {
      console.error('Shopify Fetch Error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Load cart from localStorage on client side
  useEffect(() => {
    const loadCart = async () => {
      const storedCartId = localStorage.getItem('shopifyCartId');
      if (storedCartId) {
        setCartId(storedCartId);
        await fetchCart(storedCartId);
      }
    };

    loadCart();
  }, []);

  // When authentication status changes, we might need to recreate the cart
  useEffect(() => {
    const handleAuthChange = async () => {
      // If we have items in cart and user just logged in, we should create a new cart with buyerIdentity
      if (isAuthenticated && cartItems.length > 0) {
        const lines = cartItems.map(item => ({
          merchandiseId: item.variantId,
          quantity: item.quantity
        }));
        
        // Clear old cart
        localStorage.removeItem('shopifyCartId');
        setCartId(null);
        
        // Create new cart with user identity
        await createCart(lines);
      }
    };
    
    handleAuthChange();
  }, [isAuthenticated]);

  // Fetch cart data
  const fetchCart = async (id) => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await shopifyFetch({
        query: GET_CART_QUERY,
        variables: { cartId: id }
      });
      
      if (data.cart) {
        processCartData(data.cart);
      } else {
        // If cart doesn't exist anymore, create a new one
        localStorage.removeItem('shopifyCartId');
        setCartId(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // If there's an error (like cart not found), remove the stored cart ID
      localStorage.removeItem('shopifyCartId');
      setCartId(null);
    } finally {
      setLoading(false);
    }
  };

  // Process and format cart data
  const processCartData = (cart) => {
    const items = cart.lines.edges.map(({ node }) => ({
      id: node.id,
      variantId: node.merchandise.id,
      quantity: node.quantity,
      title: node.merchandise.product.title,
      price: node.merchandise.priceV2.amount,
      currencyCode: node.merchandise.priceV2.currencyCode,
      image: node.merchandise.product.featuredImage?.url || null,
      handle: node.merchandise.product.handle,
      variantTitle: node.merchandise.title
    }));

    setCartItems(items);
    setCartCount(cart.totalQuantity);
    setCartTotal(parseFloat(cart.cost.subtotalAmount.amount));
    setCheckoutUrl(cart.checkoutUrl);
  };

  // Create a new cart
  const createCart = async (lines = []) => {
    try {
      setLoading(true);
      
      // Validate lines to ensure they have valid merchandiseIds
      const validLines = lines.filter(line => {
        // Make sure merchandiseId is a ProductVariant, not Product
        if (line.merchandiseId && line.merchandiseId.includes('/Product/')) {
          console.error("Cannot create cart with Product ID, need ProductVariant ID:", line.merchandiseId);
          return false;
        }
        
        const isValid = line.merchandiseId && isValidShopifyId(line.merchandiseId);
        if (!isValid) {
          console.error("Skipping invalid line item with merchandiseId:", line.merchandiseId);
        }
        return isValid;
      });
      
      if (validLines.length === 0) {
        throw new Error("No valid merchandise IDs to create cart");
      }
      
      console.log("Creating cart with lines:", validLines);
      
      // Cart input can include buyerIdentity when authenticated
      const cartInput = {
        lines: validLines
      };
      
      // If the user is authenticated, include their identity
      if (isAuthenticated && accessToken) {
        cartInput.buyerIdentity = {
          customerAccessToken: accessToken
        };
      }
      
      const data = await shopifyFetch({
        query: CREATE_CART_MUTATION,
        variables: { input: cartInput }
      });
      
      const { cart, userErrors } = data.cartCreate;
      
      if (userErrors.length > 0) {
        throw new Error(userErrors[0].message);
      }
      
      setCartId(cart.id);
      localStorage.setItem('shopifyCartId', cart.id);
      processCartData(cart);
      
      return cart;
    } catch (error) {
      console.error('Error creating cart:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      
      // Check if we have a product object
      if (!product) {
        console.error("Invalid product object provided to addToCart");
        setError("Invalid product data");
        return false;
      }
      
      console.log("Product received in addToCart:", product);
      
      // Get the variant ID from the product
      let variantId = product.variantId || product.id;
      
      // If we have a Product ID (not a variant ID), fetch the product's variants
      if (variantId && variantId.includes('/Product/')) {
        console.log("Product ID detected, fetching variants:", variantId);
        
        try {
          const data = await shopifyFetch({
            query: GET_PRODUCT_VARIANTS,
            variables: { id: variantId }
          });
          
          const productData = data.product;
          if (!productData) {
            throw new Error("Product not found");
          }
          
          const variants = productData.variants.edges.map(edge => edge.node);
          
          if (variants.length === 0) {
            throw new Error("No variants available for this product");
          }
          
          // Use the first available variant by default
          // In a real implementation, you might want to let the user select a variant
          const defaultVariant = variants.find(v => v.availableForSale) || variants[0];
          
          console.log("Using variant:", defaultVariant.id, defaultVariant.title);
          variantId = defaultVariant.id;
          
        } catch (variantError) {
          console.error("Error fetching product variants:", variantError);
          setError("Could not retrieve product options. Please try again.");
          return false;
        }
      } else {
        // Ensure we have a valid variant ID format
        variantId = ensureValidId(variantId);
      }
      
      if (!variantId) {
        console.error("Cannot add to cart: Invalid product variant ID", {
          original: product.variantId || product.id,
          converted: variantId
        });
        setError("Invalid product ID format");
        return false;
      }
      
      // Format the lines input
      const lines = [{
        merchandiseId: variantId,
        quantity
      }];
      
      console.log("Adding to cart with merchandiseId:", variantId);
      
      // If we don't have a cart yet, create one
      if (!cartId) {
        const cart = await createCart(lines);
        if (cart) {
          // At this point we've already processed the cart data
          return true;
        } else {
          throw new Error("Failed to create cart");
        }
      }
      
      // Otherwise, add to existing cart
      try {
        const data = await shopifyFetch({
          query: ADD_TO_CART_MUTATION,
          variables: { cartId, lines }
        });
        
        const { cart, userErrors } = data.cartLinesAdd;
        
        if (userErrors.length > 0) {
          throw new Error(userErrors[0].message);
        }
        
        processCartData(cart);
        return true;
      } catch (cartError) {
        console.error('Error with existing cart:', cartError);
        
        // If the error is due to cart not found or invalid ID, create a new cart
        if (cartError.message.includes('cart not found') || cartError.message.includes('invalid id')) {
          console.log("Cart issue detected, creating new cart");
          localStorage.removeItem('shopifyCartId');
          setCartId(null);
          
          const newCart = await createCart(lines);
          return !!newCart;
        } else {
          // For other errors, rethrow
          throw cartError;
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (lineId, quantity) => {
    if (!cartId) return;
    
    try {
      setLoading(true);
      
      const lines = [{
        id: lineId,
        quantity
      }];
      
      const data = await shopifyFetch({
        query: UPDATE_CART_MUTATION,
        variables: { cartId, lines }
      });
      
      const { cart, userErrors } = data.cartLinesUpdate;
      
      if (userErrors.length > 0) {
        throw new Error(userErrors[0].message);
      }
      
      processCartData(cart);
    } catch (error) {
      console.error('Error updating cart:', error);
      setError(error.message);
      
      // If the cart is not found, create a new one
      if (error.message.includes('cart not found') || error.message.includes('invalid id')) {
        localStorage.removeItem('shopifyCartId');
        setCartId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (lineId) => {
    if (!cartId) return;
    
    try {
      setLoading(true);
      
      const data = await shopifyFetch({
        query: REMOVE_FROM_CART_MUTATION,
        variables: { cartId, lineIds: [lineId] }
      });
      
      const { cart, userErrors } = data.cartLinesRemove;
      
      if (userErrors.length > 0) {
        throw new Error(userErrors[0].message);
      }
      
      processCartData(cart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError(error.message);
      
      // If the cart is not found, reset local state
      if (error.message.includes('cart not found') || error.message.includes('invalid id')) {
        localStorage.removeItem('shopifyCartId');
        setCartId(null);
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get checkout URL
  const getCheckoutUrl = () => {
    return checkoutUrl;
  };

  // Clear cart - we'll create a new one next time
  const clearCart = async () => {
    localStorage.removeItem('shopifyCartId');
    setCartId(null);
    setCartItems([]);
    setCartCount(0);
    setCartTotal(0);
    setCheckoutUrl(null);
  };

  return (
    <CartContext.Provider value={{
      cartId,
      cartItems,
      cartCount,
      cartTotal,
      loading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCheckoutUrl
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext); 
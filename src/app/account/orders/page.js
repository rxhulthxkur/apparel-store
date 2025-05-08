"use client"

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import Cookies from 'js-cookie';

function OrdersContent() {
  const { customer, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
  const [currentPage, setCurrentPage] = useState(1);

  // Get customer access token from cookies or localStorage
  const getCustomerAccessToken = () => {
    // First try to get from cookies
    const cookieToken = Cookies.get('customerAccessToken');
    if (cookieToken) return cookieToken;

    // If not in cookies, try localStorage with the correct key
    const localToken = localStorage.getItem('shopify_customer_token');
    if (localToken) return localToken;

    return null;
  };

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        
        const customerAccessToken = getCustomerAccessToken();
        if (!customerAccessToken) {
          throw new Error('No customer access token found');
        }
        
        const STOREFRONT_API_URL = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
        
        const ordersQuery = `
          query getCustomerOrders($customerAccessToken: String!, $first: Int!, $after: String) {
            customer(customerAccessToken: $customerAccessToken) {
              orders(first: $first, after: $after) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                edges {
                  node {
                    id
                    orderNumber
                    processedAt
                    financialStatus
                    fulfillmentStatus
                    totalPriceV2 {
                      amount
                      currencyCode
                    }
                    lineItems(first: 5) {
                      edges {
                        node {
                          title
                          quantity
                          variant {
                            image {
                              url
                              altText
                            }
                          }
                        }
                      }
                    }
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
              customerAccessToken,
              first: 5,
              after: currentPage > 1 ? pageInfo.endCursor : null
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        if (!data.data.customer) {
          throw new Error('Customer not found or token expired');
        }

        const newOrders = data.data.customer.orders.edges.map(edge => edge.node);
        setPageInfo(data.data.customer.orders.pageInfo);
        
        if (currentPage === 1) {
          setOrders(newOrders);
        } else {
          setOrders(prev => [...prev, ...newOrders]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, currentPage]);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
            <p className="text-gray-400 mb-8">You need to be signed in to view your orders.</p>
            <Link href="/login">
              <button className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Order History</h1>
          <Link href="/account">
            <button className="text-gray-400 hover:text-white">
              Back to Account
            </button>
          </Link>
        </div>

        {loading && currentPage === 1 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">
            <p>Error: {error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">You haven't placed any orders yet.</p>
            <Link href="/search">
              <button className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-900 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">Order #{order.orderNumber}</h2>
                    <p className="text-gray-400">{formatDate(order.processedAt)}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      order.financialStatus === 'PAID' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                    }`}>
                      {order.financialStatus}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ml-2 ${
                      order.fulfillmentStatus === 'FULFILLED' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'
                    }`}>
                      {order.fulfillmentStatus || 'UNFULFILLED'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Items</h3>
                    <div className="space-y-4">
                      {order.lineItems.edges.map(({ node }) => (
                        <div key={node.title} className="flex items-center space-x-4">
                          {node.variant?.image && (
                            <div className="relative w-16 h-16 bg-gray-800 rounded overflow-hidden">
                              <Image
                                src={node.variant.image.url}
                                alt={node.variant.image.altText || node.title}
                                fill
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{node.title}</p>
                            <p className="text-gray-400">Quantity: {node.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            order.totalPriceV2.amount,
                            order.totalPriceV2.currencyCode
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {pageInfo.hasNextPage && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Loading...
                    </span>
                  ) : (
                    'Load More Orders'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
} 
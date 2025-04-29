"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    clearCart, 
    loading, 
    getCheckoutUrl 
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(id, parseInt(newQuantity));
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    const checkoutUrl = getCheckoutUrl();
    
    if (checkoutUrl) {
      // Redirect to Shopify checkout
      window.location.href = checkoutUrl;
    } else {
      // Fallback if no checkout URL is available
      alert('Unable to proceed to checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-10">Your Cart</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link href="/search">
              <button className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="border-b border-gray-700 pb-2 mb-4">
                <h2 className="text-xl font-semibold">
                  {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                </h2>
              </div>
              
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row border-b border-gray-800 pb-6">
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-32 mb-4 sm:mb-0 relative bg-gray-800 rounded overflow-hidden">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span>No image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 sm:ml-6 flex flex-col">
                      <div className="flex justify-between">
                        <Link href={`/products/${item.handle}`}>
                          <h3 className="text-lg font-medium hover:text-gray-300">{item.title}</h3>
                        </Link>
                        <p className="font-semibold">
                          {formatCurrency(item.price * item.quantity, item.currencyCode)}
                        </p>
                      </div>
                      
                      <p className="text-gray-400 mt-1">
                        {formatCurrency(item.price, item.currencyCode)} each
                        {item.variantTitle && ` - ${item.variantTitle}`}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        {/* Quantity Controls */}
                        <div className="flex items-center mt-4">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full"
                            aria-label="Decrease quantity"
                            disabled={loading}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            min="1"
                            className="w-12 mx-2 bg-transparent text-center border-none"
                            disabled={loading}
                          />
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full"
                            aria-label="Increase quantity"
                            disabled={loading}
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Remove button */}
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-white mt-4"
                          aria-label="Remove item"
                          disabled={loading}
                        >
                          {loading ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link href="/search">
                  <button className="flex items-center text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-700 my-4 pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Estimated Total</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut || loading || cartItems.length === 0}
                  className="w-full bg-white text-black py-3 rounded-md font-medium hover:bg-gray-200 transition disabled:opacity-70 flex items-center justify-center"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Redirecting to Checkout...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';

function ProductContent() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, cartCount, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    setQuantity(parseInt(newQuantity));
  };

  const handleAddToCart = async () => {
    if (product) {
      // For products with variants that require size selection
      if (product.variants?.edges?.length > 0 && !selectedSize) {
        alert('Please select a size');
        return;
      }

      setAddingToCart(true);

      // Get the selected variant if available
      let selectedVariant;
      if (selectedSize && product.variants?.edges) {
        selectedVariant = product.variants.edges.find(
          edge => edge.node.title === selectedSize
        )?.node;
      }

      // Default to first variant if no size selected but variants exist
      const defaultVariant = product.variants?.edges?.[0]?.node;
      
      // Log the variant ID for debugging
      console.log("Selected variant:", selectedVariant);
      console.log("Product ID:", product.id);
      console.log("Variant ID to use:", selectedVariant ? selectedVariant.id : (defaultVariant?.id || product.id));

      const productToAdd = {
        id: product.id, // Always use the product ID for the main ID
        variantId: selectedVariant ? selectedVariant.id : (defaultVariant?.id || product.id),
        title: product.title,
        price: selectedVariant ? selectedVariant.price.amount : product.priceRange.minVariantPrice.amount,
        image: product.images.edges[0]?.node.url || null,
        handle: product.handle,
        size: selectedSize,
      };

      console.log("Adding product to cart:", productToAdd);
      try {
        const result = await addToCart(productToAdd, quantity);
        if (!result) {
          alert('Could not add to cart. Please try again.');
        }
      } catch (error) {
        console.error("Add to cart error:", error);
        alert('Error adding to cart: ' + error.message);
      } finally {
        setAddingToCart(false);
      }
    }
  };

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true);
        
        // Construct the query for Shopify Storefront API
        const STOREFRONT_API_URL = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
        
        const productQuery = `
          query getProductByHandle($handle: String!) {
            productByHandle(handle: $handle) {
              id
              title
              handle
              description
              descriptionHtml
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
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
            query: productQuery,
            variables: {
              handle: params.handle
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        if (!data.data.productByHandle) {
          throw new Error('Product not found');
        }

        setProduct(data.data.productByHandle);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.handle) {
      fetchProductDetails();
    }
  }, [params.handle]);

  // For demo purposes, if Shopify API is not connected, use dummy data
  useEffect(() => {
    if (error && error.includes('Failed to fetch')) {
      // Sample product data for demo
      const dummyProduct = {
        id: 'gid://shopify/Product/123456789',
        title: 'Premium Cotton T-Shirt',
        handle: params.handle,
        description: 'A comfortable, breathable cotton t-shirt perfect for everyday wear. Features a classic cut and durable fabric that will last through many washes.',
        descriptionHtml: '<p>A comfortable, breathable cotton t-shirt perfect for everyday wear. Features a classic cut and durable fabric that will last through many washes.</p>',
        priceRange: {
          minVariantPrice: {
            amount: '29.99',
            currencyCode: 'USD'
          }
        },
        images: {
          edges: [
            {
              node: {
                url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800',
                altText: 'Premium Cotton T-Shirt'
              }
            },
            {
              node: {
                url: 'https://images.unsplash.com/photo-1529720317453-c8da503f2051?q=80&w=800',
                altText: 'Premium Cotton T-Shirt Side View'
              }
            }
          ]
        },
        variants: {
          edges: [
            { 
              node: { 
                id: 'gid://shopify/ProductVariant/12345', 
                title: 'Small', 
                price: { amount: '29.99', currencyCode: 'USD' }, 
                availableForSale: true 
              } 
            },
            { 
              node: { 
                id: 'gid://shopify/ProductVariant/12346', 
                title: 'Medium', 
                price: { amount: '29.99', currencyCode: 'USD' }, 
                availableForSale: true 
              } 
            },
            { 
              node: { 
                id: 'gid://shopify/ProductVariant/12347', 
                title: 'Large', 
                price: { amount: '29.99', currencyCode: 'USD' }, 
                availableForSale: true 
              } 
            },
            { 
              node: { 
                id: 'gid://shopify/ProductVariant/12348', 
                title: 'X-Large', 
                price: { amount: '29.99', currencyCode: 'USD' }, 
                availableForSale: false 
              } 
            }
          ]
        }
      };

      setProduct(dummyProduct);
      setError(null);
      setLoading(false);
    }
  }, [error, params.handle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center">
            <Link href="/" className="mr-8">
              <div className="flex items-center justify-center h-12 w-12 bg-white text-black rounded-full font-bold text-xl">
                RT
              </div>
            </Link>
          </div>
        </nav>
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center">
            <Link href="/" className="mr-8">
              <div className="flex items-center justify-center h-12 w-12 bg-white text-black rounded-full font-bold text-xl">
                RT
              </div>
            </Link>
          </div>
        </nav>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)]">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/search">
            <button className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition">
              Back to Products
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const variants = product.variants?.edges || [];
  const sizes = variants.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    available: edge.node.availableForSale
  }));

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
        
        <div className="flex items-center">
          <form onSubmit={handleSearch} className="relative mr-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="bg-gray-900 text-white px-4 py-2 rounded-full w-64 focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          {isAuthenticated ? (
            <Link href="/account" className="p-2 rounded-full hover:bg-gray-800 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          ) : (
            <Link href="/login" className="p-2 rounded-full hover:bg-gray-800 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </Link>
          )}
          <Link href="/cart">
            <div className="p-2 rounded-full hover:bg-gray-800 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </div>
              )}
            </div>
          </Link>
        </div>
      </nav>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/search" className="hover:text-white">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{product.title}</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-4 aspect-h-5 bg-gray-900 rounded-lg overflow-hidden">
              {product.images.edges.length > 0 ? (
                <div className="relative h-[500px]">
                  <Image
                    src={product.images.edges[0].node.url}
                    alt={product.images.edges[0].node.altText || product.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[500px] bg-gray-800">
                  <p>No image available</p>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.edges.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.edges.map((image, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 bg-gray-900 rounded overflow-hidden">
                    <div className="relative h-20">
                      <Image
                        src={image.node.url}
                        alt={image.node.altText || `${product.title} - Image ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="cursor-pointer hover:opacity-80"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-2xl font-semibold mb-6">
              {formatCurrency(
                product.priceRange.minVariantPrice.amount,
                product.priceRange.minVariantPrice.currencyCode
              )}
            </p>
            
            {/* Product Description */}
            <div className="prose prose-invert mb-8">
              <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml || `<p>${product.description}</p>` }} />
            </div>
            
            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-3">Size</h3>
                <div className="grid grid-cols-4 gap-2 mb-1">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.title)}
                      disabled={!size.available}
                      className={`
                        py-2 px-4 rounded border ${
                          selectedSize === size.title
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent border-gray-600 hover:border-white'
                        }
                        ${!size.available ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {size.title}
                    </button>
                  ))}
                </div>
                {!selectedSize && sizes.some(size => size.available) && (
                  <p className="text-sm text-gray-400 mt-2">Please select a size</p>
                )}
                {!sizes.some(size => size.available) && (
                  <p className="text-sm text-red-500 mt-2">All sizes currently unavailable</p>
                )}
              </div>
            )}
            
            {/* Quantity Selector */}
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3">Quantity</h3>
              <div className="flex items-center">
                <button 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-900 rounded-l border border-gray-600"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  min="1"
                  className="w-16 h-10 bg-gray-900 text-center border-t border-b border-gray-600"
                />
                <button 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-900 rounded-r border border-gray-600"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || cartLoading || (sizes.length > 0 && !selectedSize)}
                className="flex-1 bg-white text-black py-3 px-6 rounded-md font-medium hover:bg-gray-200 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {addingToCart || cartLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Adding...
                  </>
                ) : (
                  'Add to Cart'
                )}
              </button>
              
              <Link href="/cart" className="flex-1">
                <button className="w-full bg-transparent border border-white text-white py-3 px-6 rounded-md font-medium hover:bg-white/10 transition">
                  View Cart
                </button>
              </Link>
            </div>
            
            {/* Product Details */}
            <div className="mt-10 border-t border-gray-800 pt-6">
              <h3 className="text-sm font-medium mb-3">Product Details</h3>
              <ul className="list-disc pl-4 text-sm text-gray-400 space-y-2">
                <li>High-quality materials</li>
                <li>Ethically manufactured</li>
                <li>Durable and long-lasting</li>
                <li>Machine washable</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    }>
      <ProductContent />
    </Suspense>
  );
} 
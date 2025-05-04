"use client"

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';

function CollectionContent() {
  const router = useRouter();
  const params = useParams();
  const collectionHandle = params.collection;
  const [products, setProducts] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount, addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [addingToCart, setAddingToCart] = useState(null);

  // Format the collection name for display
  const formatCollectionTitle = (handle) => {
    if (!handle) return '';
    return handle
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(product.id);
    
    // Get the default variant if available
    const defaultVariant = product.variants?.edges[0]?.node;
    
    // Log the variant ID for debugging
    console.log("Product from collection:", product);
    console.log("Default variant:", defaultVariant);
    console.log("Variant ID to use:", defaultVariant?.id || product.id);
    
    const productToAdd = {
      id: product.id,
      variantId: defaultVariant?.id || product.id,
      title: product.title,
      price: defaultVariant ? defaultVariant.price?.amount : product.priceRange.minVariantPrice.amount,
      image: product.images.edges[0]?.node.url || null,
      handle: product.handle,
    };

    console.log("Adding to cart from collection:", productToAdd);
    try {
      const result = await addToCart(productToAdd, 1);
      if (!result) {
        console.error("Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setAddingToCart(null);
    }
  };

  useEffect(() => {
    async function fetchCollectionProducts() {
      try {
        setLoading(true);
        
        // Construct the query for Shopify Storefront API
        const STOREFRONT_API_URL = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
        
        const collectionQuery = `
          query getCollectionByHandle($handle: String!) {
            collectionByHandle(handle: $handle) {
              id
              title
              description
              image {
                url
                altText
              }
              products(first: 24) {
                edges {
                  node {
                    id
                    title
                    handle
                    description
                    priceRange {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                    }
                    images(first: 1) {
                      edges {
                        node {
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
        `;

        const response = await fetch(STOREFRONT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
          },
          body: JSON.stringify({
            query: collectionQuery,
            variables: {
              handle: collectionHandle
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch collection products');
        }

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        if (!data.data.collectionByHandle) {
          throw new Error('Collection not found');
        }

        const collectionData = data.data.collectionByHandle;
        setCollection(collectionData);
        const fetchedProducts = collectionData.products.edges.map(edge => edge.node);
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching collection products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (collectionHandle) {
      fetchCollectionProducts();
    }
  }, [collectionHandle]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header/Navigation - this could be a shared component */}
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
            <Link href="/search/kids-collection" className="text-white hover:text-gray-300">Kids</Link>
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

      {/* Collection Header */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <h1 className="text-3xl font-bold mb-2">
          {collection ? collection.title : formatCollectionTitle(collectionHandle)}
        </h1>
        {collection && collection.description && (
          <p className="text-gray-400 mb-6">{collection.description}</p>
        )}
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">
            <p>Error: {error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p>No products found in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link href={`/products/${product.handle}`} key={product.id}>
                <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform relative group">
                  <div className="h-64 relative">
                    {product.images.edges.length > 0 ? (
                      <Image
                        src={product.images.edges[0].node.url}
                        alt={product.images.edges[0].node.altText || product.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <p>No image available</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="bg-white text-black py-2 px-4 rounded-full font-medium hover:bg-gray-200 transition transform -translate-y-2 group-hover:translate-y-0"
                        disabled={addingToCart === product.id}
                      >
                        {addingToCart === product.id ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                            Adding...
                          </span>
                        ) : (
                          'Add to Cart'
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{product.title}</h3>
                    <p className="text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                    <p className="text-white font-bold mt-2">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: product.priceRange.minVariantPrice.currencyCode,
                      }).format(product.priceRange.minVariantPrice.amount)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    }>
      <CollectionContent />
    </Suspense>
  );
} 
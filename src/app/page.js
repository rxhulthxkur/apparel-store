"use client"
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import './animations.css';
import Footer from '../components/Footer';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount, addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const productsPerSlide = 3;
  const totalSlides = 5; // 15 products / 3 products per slide = 5 slides

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const defaultVariant = product.variants?.edges[0]?.node;
    
    const productToAdd = {
      id: product.id,
      variantId: defaultVariant?.id || product.id,
      title: product.title,
      price: defaultVariant ? defaultVariant.price?.amount : product.priceRange.minVariantPrice.amount,
      image: product.images.edges[0]?.node.url || null,
      handle: product.handle,
    };

    try {
      await addToCart(productToAdd, 1);
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  const handleCarouselNavigation = (direction) => {
    if (direction === 'next') {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    } else {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const STOREFRONT_API_URL = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
        
        const productsQuery = `
          query getFeaturedProducts {
            products(first: 15) {
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
        `;

        const response = await fetch(STOREFRONT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
          },
          body: JSON.stringify({
            query: productsQuery
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        const fetchedProducts = data.data.products.edges.map(edge => edge.node);
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    }

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isHovered]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header/Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 fade-in">
        <div className="flex items-center">
          <Link href="/" className="mr-8">
            <div className="flex items-center justify-center h-12 w-12 bg-white text-black rounded-full font-bold text-xl hover-scale">
              RT
            </div>
          </Link>
          <div className="hidden md:flex space-x-8 stagger-fade-in">
            <Link href="/search" className="text-white hover:text-gray-300">All</Link>
            <Link href="/search/womens-collection" className="text-white hover:text-gray-300">Women</Link>
            <Link href="/search/mens-collection" className="text-white hover:text-gray-300">Men</Link>
            {/* <Link href="/search/kids" className="text-white hover:text-gray-300">Kids</Link> */}
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

      {/* Hero Section - Full Width Banner */}
      <div className="relative h-[600px] w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/images/women.jpg')] bg-cover bg-center">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        </div>
        
        {/* Text Content */}
        <div className="absolute inset-0 flex items-center px-8 max-w-7xl mx-auto">
          <div className="md:max-w-2xl slide-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
              Discover the Latest
              <br />
              <span className="text-gradient">Fashion Trends</span>
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Explore our curated collections of stylish apparel and
              accessories for every occasion.
            </p>
            <div className="flex flex-wrap gap-4 stagger-fade-in">
              <Link href="/search/womens-collection">
                <button className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition hover-scale">
                  Shop Women
                </button>
              </Link>
              <Link href="/search/mens-collection">
                <button className="bg-transparent border border-white text-white px-6 py-3 rounded hover:bg-white/10 transition hover-scale">
                  Shop Men
                </button>
              </Link>
            </div>
          </div>
          
          {/* Fashion Image/Text Overlay */}
          {/* <div className="hidden md:flex items-center justify-center absolute right-20 top-1/2 -translate-y-1/2">
            <h2 className="text-9xl font-bold text-white opacity-80 glow-text">FASHIONN</h2>
          </div> */}
        </div>
      </div>

      {/* Collections Section */}
      <section className="px-8 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 slide-in">Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-fade-in">
          <Link href="/search/womens-collection" className="group">
            <div className="relative h-96 rounded-lg overflow-hidden hover-scale">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
              <div className="absolute inset-0 bg-[url('/images/women.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute bottom-0 left-0 p-6 z-20">
                <h3 className="text-2xl font-bold text-white mb-2 glow-text">Women's Collection</h3>
                <p className="text-white/80">Discover the latest trends</p>
              </div>
            </div>
          </Link>
          <Link href="/search/mens-collection" className="group">
            <div className="relative h-96 rounded-lg overflow-hidden hover-scale">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
              <div className="absolute inset-0 bg-[url('/images/rahul.JPG')] bg-cover bg-center group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute bottom-0 left-0 p-6 z-20">
                <h3 className="text-2xl font-bold text-white mb-2 glow-text">Men's Collection</h3>
                <p className="text-white/80">Elevate your style</p>
              </div>
            </div>
          </Link>
          <Link href="/search/new-arrivals" className="group">
            <div className="relative h-96 rounded-lg overflow-hidden hover-scale">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
              <div className="absolute inset-0 bg-[url('/images/arrival.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute bottom-0 left-0 p-6 z-20">
                <h3 className="text-2xl font-bold text-white mb-2 glow-text">New Arrivals</h3>
                <p className="text-white/80">Shop the latest styles</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Product Carousel Section */}
      <section className="px-8 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 slide-in">Featured Products</h2>
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden">
            <div 
              ref={carouselRef}
              className="flex transition-transform duration-500 ease-in-out"
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-3 gap-4 px-4">
                    {products
                      .slice(slideIndex * productsPerSlide, (slideIndex + 1) * productsPerSlide)
                      .map((product) => (
                        <div key={product.id}>
                          <Link href={`/products/${product.handle}`}>
                            <div className="bg-gray-900 rounded-lg overflow-hidden group">
                              <div className="h-96 relative">
                                {product.images.edges.length > 0 ? (
                                  <Image
                                    src={product.images.edges[0].node.url}
                                    alt={product.images.edges[0].node.altText || product.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="transform group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <p>No image available</p>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <button 
                                    onClick={(e) => handleAddToCart(e, product)}
                                    className="bg-white text-black py-2 px-4 rounded-full font-medium hover:bg-gray-200 transition transform -translate-y-2 group-hover:translate-y-0"
                                  >
                                    Add to Cart
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
                        </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => handleCarouselNavigation('prev')}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => handleCarouselNavigation('next')}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Animated Ad Banner */}
      <div className="relative overflow-hidden gradient-bg py-8">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-2xl font-bold text-white mx-4 glow-text">✨ Free Shipping on Orders Over $50 ✨</span>
          <span className="text-2xl font-bold text-white mx-4 glow-text">🎉 30% Off New Arrivals 🎉</span>
          <span className="text-2xl font-bold text-white mx-4 glow-text">💫 Limited Time Offers 💫</span>
        </div>
      </div>

      {/* Seasonal Collection */}
      <section className="px-8 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 slide-in">Seasonal Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-fade-in">
          <div className="relative h-[500px] rounded-lg overflow-hidden group hover-scale">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
            <div className="absolute inset-0 bg-[url('/images/summer.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute bottom-0 left-0 p-8 z-20">
              <h3 className="text-4xl font-bold text-white mb-4 glow-text">Summer Collection</h3>
              <p className="text-white/80 text-lg mb-6">Light and breezy styles for the season</p>
              <Link href="/search/summer-collection">
                <button className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition hover-scale">
                  Shop Now
                </button>
              </Link>
            </div>
          </div>
          <div className="relative h-[500px] rounded-lg overflow-hidden group hover-scale">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
            <div className="absolute inset-0 bg-[url('/images/winter.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute bottom-0 left-0 p-8 z-20">
              <h3 className="text-4xl font-bold text-white mb-4 glow-text">Winter Collection</h3>
              <p className="text-white/80 text-lg mb-6">Fresh styles for the new season</p>
              <Link href="/search/winter-collection">
                <button className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition hover-scale">
                  Shop Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Add this to your globals.css
// @keyframes marquee {
//   0% { transform: translateX(100%); }
//   100% { transform: translateX(-100%); }
// }
// .animate-marquee {
//   animation: marquee 20s linear infinite;
// }

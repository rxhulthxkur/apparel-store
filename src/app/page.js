"use client"
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
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

      {/* Hero Section */}
      <main className="px-8 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover the Latest
              <br />
              Fashion Trends
            </h1>
            <p className="text-xl mb-8">
              Explore our curated collections of stylish apparel and
              accessories for every occasion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/search/womens-collection">
                <button className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition">
                  Shop Women
                </button>
              </Link>
              <Link href="/search/mens-collection">
                <button className="bg-transparent border border-white text-white px-6 py-3 rounded hover:bg-white/10 transition">
                  Shop Men
                </button>
              </Link>
              {/* <Link href="/search/sales-collection">
                <button className="bg-transparent border border-white text-white px-6 py-3 rounded hover:bg-white/10 transition">
                  Shop Sales
                </button>
              </Link> */}
            </div>
          </div>
          <div className="hidden md:block">
            {/* Featured image placeholder - replace with your actual image */}
            <div className="bg-pink-500 rounded-lg p-8 h-96 w-full relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-8xl font-bold text-green-800">FASHION</h2>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Featured Collection Section - mobile only */}
      <div className="md:hidden mt-8 px-8">
        <div className="bg-pink-500 rounded-lg p-8 h-64 w-full relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-6xl font-bold text-green-800">FASHION</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

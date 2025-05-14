"use client"
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../../components/Footer';

export default function AboutPage() {
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
          <div className="hidden md:flex space-x-8">
            <Link href="/search" className="text-white hover:text-gray-300">All</Link>
            <Link href="/search/womens-collection" className="text-white hover:text-gray-300">Women</Link>
            <Link href="/search/mens-collection" className="text-white hover:text-gray-300">Men</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-3xl mx-auto fade-in">
            <h1 className="text-5xl font-bold mb-6 glow-text">About RT Fashion</h1>
            <p className="text-xl text-gray-200">
              Crafting the future of fashion with style, sustainability, and innovation
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="slide-in">
              <h2 className="text-3xl font-bold mb-6 text-gradient">Our Story</h2>
              <p className="text-gray-300 mb-4">
                Founded in 2025, RT Fashion emerged from a vision to revolutionize the online fashion retail experience. 
                We believe that style should be accessible, sustainable, and personal.
              </p>
              <p className="text-gray-300 mb-4">
                Our journey began with a simple idea: to create a platform where fashion meets technology, 
                where traditional retail transforms into an immersive digital experience.
              </p>
              <p className="text-gray-300">
                Today, we're proud to serve customers worldwide, offering carefully curated collections 
                that blend contemporary trends with timeless elegance.
              </p>
            </div>
            <div className="fade-in">
              <div className="gradient-bg rounded-lg p-8 h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-6xl font-bold text-white glow-text">EST. 2025</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-gradient">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8 stagger-fade-in">
            <div className="text-center p-6 hover-scale">
              <div className="h-16 w-16 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Innovation</h3>
              <p className="text-gray-400">
                Pushing the boundaries of online fashion retail with cutting-edge technology and design.
              </p>
            </div>
            <div className="text-center p-6 hover-scale">
              <div className="h-16 w-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Sustainability</h3>
              <p className="text-gray-400">
                Committed to ethical fashion and reducing our environmental impact.
              </p>
            </div>
            <div className="text-center p-6 hover-scale">
              <div className="h-16 w-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Community</h3>
              <p className="text-gray-400">
                Building a global community of fashion enthusiasts and trendsetters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-gradient">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8 stagger-fade-in">
            <div className="text-center">
              <div className="h-64 w-64 mx-auto mb-6 rounded-full overflow-hidden">
                <Image
                  src="/images/team1.jpg"
                  alt="Team Member"
                  width={256}
                  height={256}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Rahul Thakur</h3>
              <p className="text-gray-400">Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="h-64 w-64 mx-auto mb-6 rounded-full overflow-hidden">
                <Image
                  src="/images/team2.jpg"
                  alt="Team Member"
                  width={256}
                  height={256}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Shubham Thakur</h3>
              <p className="text-gray-400">Creative Director</p>
            </div>
            <div className="text-center">
              <div className="h-64 w-64 mx-auto mb-6 rounded-full overflow-hidden">
                <Image
                  src="/images/team3.jpg"
                  alt="Team Member"
                  width={256}
                  height={256}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Shivam Thakur</h3>
              <p className="text-gray-400">Head of Design</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
} 
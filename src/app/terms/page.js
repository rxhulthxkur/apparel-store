"use client"
import Link from 'next/link';
import Footer from '../../components/Footer';

export default function TermsPage() {
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

      {/* Terms Content */}
      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gradient">Terms and Conditions</h1>
          
          <div className="space-y-8 text-gray-300">
            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </div>

            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on RT Fashion's website for personal, non-commercial transitory viewing only.
              </p>
              <p className="mb-4">This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </div>

            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Product Information</h2>
              <p className="mb-4">
                We strive to display as accurately as possible the colors and images of our products. However, we cannot guarantee that your computer monitor's display of any color will be accurate.
              </p>
              <p className="mb-4">
                All descriptions of products or product pricing are subject to change at any time without notice, at our sole discretion.
              </p>
            </div>

            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Pricing and Payment</h2>
              <p className="mb-4">
                All prices are in USD and are subject to change without notice. We reserve the right to modify or discontinue any product without notice at any time.
              </p>
              <p className="mb-4">
                Payment must be made in full before the order is processed. We accept various payment methods as indicated during checkout.
              </p>
            </div>

            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Shipping and Delivery</h2>
              <p className="mb-4">
                Shipping times and costs are estimates only. We are not responsible for delays beyond our control.
              </p>
              <p className="mb-4">
                Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier.
              </p>
            </div>

            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Returns and Refunds</h2>
              <p className="mb-4">
                Our return policy allows for returns within 30 days of delivery. Items must be unworn, unwashed, and in original packaging with all tags attached.
              </p>
              <p className="mb-4">
                Refunds will be processed within 5-7 business days after we receive the returned item.
              </p>
            </div>

            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">7. User Accounts</h2>
              <p className="mb-4">
                When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the security of your account.
              </p>
              <p className="mb-4">
                We reserve the right to terminate accounts, remove or edit content, or cancel orders at our sole discretion.
              </p>
            </div>

            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">8. Intellectual Property</h2>
              <p className="mb-4">
                The website and its original content, features, and functionality are owned by RT Fashion and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </div>

            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Limitation of Liability</h2>
              <p className="mb-4">
                In no event shall RT Fashion, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
              </p>
            </div>

            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">10. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
            </div>

            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">11. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify or replace these Terms at any time. It is your responsibility to check these Terms periodically for changes.
              </p>
            </div>

            <div className="slide-in">
              <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact Information</h2>
              <p className="mb-4">
                Questions about the Terms should be sent to us at:
              </p>
              <div className="bg-gray-900 p-6 rounded-lg">
                <p className="mb-2">Email: rahul7087.ca23@chitkara.edu.in</p>
                <p className="mb-2">Phone: +91 78072421677</p>
                <p>Address: Chitkara University, Rajpura.</p>
              </div>
            </div>

            <div className="slide-in text-sm text-gray-400 mt-12">
              <p>Last Updated: March 15, 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
} 
'use client';
import Link from 'next/link';
import Image from 'next/image';
export default function AboutUs() {
  return (
    <>
      <header className="flex items-center bg-black h-28 px-4 py-0 shadow w-full justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
          <Image src="/chorebazaar-logo.png" alt="ChoreBazaar Logo" width={112} height={112} className="h-full w-auto object-contain" />
          <div className="ml-4">
            <h1 className="text-4xl font-bold text-white">ChoreBazaar</h1>
            <p className="text-lg text-gray-300">Handpicked Deals. Less Noise. More Value.</p>
          </div>
        </div>

        <nav className="flex space-x-8">
          <Link href="/" className="text-white hover:text-gray-400">Home</Link>
          <Link href="/about" className="text-white hover:text-gray-400">About Us</Link>
          <Link href="/terms-and-conditions" className="text-white hover:text-gray-400">Terms & Conditions</Link>
          <Link href="/contact" className="text-white hover:text-gray-400">Contact Us</Link>
        </nav>
      </header>

      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-4xl font-bold mb-4">About ChoreBazaar</h1>
        <p className="mb-4">
          Welcome to ChoreBazaar! We are a passionate team dedicated to bringing you the best curated deals across Amazon, Flipkart, and more.
        </p>
        <p className="mb-4">
          Our mission is simple: cut through the noise and bring you handpicked deals that offer the best value. We want to make your shopping smarter, easier, and more enjoyable.
        </p>
        <p>
          ChoreBazaar is independently curated and is not directly owned or operated by any e-commerce retailer.
        </p>
        <p className="mt-4">
          For queries or collaborations, reach out to us at <strong>support@chorebazaar.com</strong>.
        </p>
      </div>
    </>
  );
}
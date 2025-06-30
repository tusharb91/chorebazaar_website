'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Deal {
  id: string;
  title: string;
  price: string;
  discount: string;
  image: string;
  link: string;
  description: string;
}

export default function DealPage() {
  const params = useParams();
  const id = params?.id as string;
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    async function fetchDeal() {
      try {
        const response = await fetch('/api/deals');
        const data = await response.json();
        const foundDeal = data.deals.find((d: Deal) => d.id === id);
        setDeal(foundDeal || null);
      } catch (error) {
        console.error('Error fetching deal:', error);
      }
    }

    fetchDeal();
  }, [id]);

  if (!deal) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex justify-center items-center">
        <p>Loading deal details...</p>
      </div>
    );
  }

  const currentPrice = parseFloat(deal.price.replace(/[^\d.]/g, '')) || 0;
  const discountValue = parseFloat(deal.discount.replace(/[^\d.]/g, '')) || 0;
  const originalPrice = currentPrice / (1 - discountValue / 100);

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

      <div className="min-h-screen bg-black text-white p-4 sm:p-8 flex flex-col items-center">
        <Image src={deal.image} alt={deal.title} width={300} height={200} className="rounded mb-4 max-w-full h-auto" />
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">{deal.title}</h1>
        <p className="text-lg mb-2">Current Price: ₹{deal.price}</p>
        <p className="text-lg mb-2 text-gray-400">Original Price: ₹{originalPrice.toFixed(2)}</p>
        <p className="text-green-400 mb-4">Discount: {deal.discount}</p>
        <p className="mb-6 max-w-2xl text-center">{deal.description}</p>
        {deal.link ? (
          <a
            href={deal.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black px-4 py-2 sm:px-6 sm:py-3 rounded shadow hover:bg-gray-300 transition text-center"
          >
            Buy on Amazon
          </a>
        ) : (
          <button
            className="bg-gray-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded shadow cursor-not-allowed"
            disabled
          >
            Link Unavailable
          </button>
        )}
      </div>
    </>
  );
}
'use client';

import { useEffect, useState, useRef } from 'react';
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
  category?: string;
  subcategory?: string;
}

export default function DealPage() {
  const params = useParams();
  const id = params?.id as string;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [relatedDeals, setRelatedDeals] = useState<Deal[]>([]);
  // const [scrollPosition, setScrollPosition] = useState(0);
  // const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  // const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Deal[]>([]);

  useEffect(() => {
    async function fetchDeal() {
      try {
        const response = await fetch('/api/deals');
        const data = await response.json();
        const foundDeal = data.deals.find((d: Deal) => d.id === id);
        setDeal(foundDeal || null);

        if (foundDeal) {
          const related = data.deals
            .filter((d: Deal) => d.id !== foundDeal.id && (d.category === foundDeal.category || d.subcategory === foundDeal.subcategory || d.title.toLowerCase().includes(foundDeal.title.split(' ')[0].toLowerCase())))
            .sort((a: Deal, b: Deal) => {
              const discountA = parseFloat(a.discount.replace(/[^\d.]/g, '')) || 0;
              const discountB = parseFloat(b.discount.replace(/[^\d.]/g, '')) || 0;
              return discountB - discountA;
            })
            .slice(0, 50);

          // if (activeSearchQuery) {
          //   related = related.filter((deal) =>
          //     deal.title.toLowerCase().includes(activeSearchQuery.toLowerCase())
          //   );
          // }

          setRelatedDeals(related);
        }
      } catch (error) {
        console.error('Error fetching deal:', error);
      }
    }

    fetchDeal();
  }, [id]);

  function handleScroll(e: React.UIEvent<HTMLDivElement, UIEvent>) {
    e.preventDefault();
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      // Adjust scroll speed factor to a very low value
      const scrollSpeedFactor = 0.3;

      container.scrollLeft += e.nativeEvent instanceof WheelEvent ? Math.sign(e.nativeEvent.deltaY) * scrollSpeedFactor : 0;

      const totalWidth = container.scrollWidth / 3; // Since we tripled the items

      if (container.scrollLeft <= 0) {
        container.scrollLeft = totalWidth;
      } else if (container.scrollLeft >= totalWidth * 2) {
        container.scrollLeft = totalWidth;
      }
    }
  }

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
      <div className="flex justify-end mt-6 mb-6 relative pr-4">
        <input
          type="text"
          placeholder="Search deals..."
          value={searchQuery}
          onChange={(e) => {
            const query = e.target.value;
            setSearchQuery(query);
            setSelectedSuggestionIndex(-1);
            if (query.trim()) {
              const filteredSuggestions = relatedDeals
                .filter((deal) => deal.title.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 4);
              setSuggestions(filteredSuggestions);
            } else {
              setSuggestions([]);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedSuggestionIndex((prevIndex) =>
                prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
              );
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedSuggestionIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
              );
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
                window.location.href = `/deals/${suggestions[selectedSuggestionIndex].id}`;
              } else {
                window.location.href = `/?query=${encodeURIComponent(searchQuery.trim())}`;
              }
            }
          }}
          className="px-4 py-2 rounded bg-gray-800 text-white w-80"
        />
        {suggestions.length > 0 && (
          <ul className="absolute mt-12 w-80 max-h-40 overflow-y-auto text-sm space-y-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                className={`flex items-center cursor-pointer p-1 ${index === selectedSuggestionIndex ? 'bg-gray-600' : ''}`}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
                onClick={() => window.location.href = `/deals/${suggestion.id}`}
              >
                <Image src={suggestion.image} alt={suggestion.title} width={30} height={30} className="rounded mr-2" />
                <span className="text-white">
                  {suggestion.title.length > 20 ? suggestion.title.slice(0, 20) + '..' : suggestion.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="min-h-screen bg-black text-white p-4 sm:p-8 flex flex-col items-center">
        <div className="flex flex-col sm:flex-row items-center sm:items-start w-full max-w-4xl mb-6 pl-4">
          <div className="sm:mr-6 mb-4 sm:mb-0">
            <Image src={deal.image} alt={deal.title} width={200} height={150} className="rounded max-w-full h-auto" />
          </div>
          <div className="flex-1 text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-left">{deal.title}</h1>
            <p className="text-lg mb-2 text-left">Current Price: ₹{deal.price}</p>
            <p className="text-lg mb-2 text-gray-400 text-left">Original Price: ₹{originalPrice.toFixed(2)}</p>
            <p className="text-green-400 mb-4 text-left">Discount: {deal.discount}</p>
            <p className="mb-6 max-w-2xl text-left">{deal.description}</p>
            {deal.link ? (
              <a
                href={deal.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black px-4 py-2 sm:px-6 sm:py-3 rounded shadow hover:bg-gray-300 transition text-left"
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
        </div>

        <p className="text-sm text-gray-400 mt-6 text-center max-w-2xl">
          Disclaimer: ChoreBazaar is an Amazon affiliate platform. We may earn a commission from qualifying purchases made through the links on this page.
        </p>

        <div className="mt-12 w-full max-w-6xl">
          <h2 className="text-xl font-semibold mb-4 text-center">Related Items</h2>
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto space-x-4 p-4 bg-gray-800 rounded relative"
            onWheel={handleScroll}
          >
            {relatedDeals.length > 0 ? (
              [...relatedDeals, ...relatedDeals, ...relatedDeals].map((item, index) => {
                return (
                  <Link key={`${item.id}-${index}`} href={`/deals/${item.id}`} className="flex-none w-48 bg-gray-700 rounded p-4 hover:bg-gray-600 transition">
                    <Image src={item.image} alt={item.title} width={160} height={100} className="rounded object-cover mx-auto mb-2" />
                    <p className="text-center text-sm">{item.title}</p>
                  </Link>
                );
              })
            ) : (
              <p className="text-center text-gray-400">No related items found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
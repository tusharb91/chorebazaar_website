'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Deal {
  asin: string;
  title: string;
  price: string;
  discount: string;
  image: string;
  link: string;
  description: string;
  category?: string;
  subcategory?: string;
  // Optional field to accommodate future tracking if needed
  trackClicks?: boolean;
}

export default function DealPage() {
  const params = useParams();
  const asin = params?.id as string;
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
    async function fetchDealFromDB() {
      try {
        const response = await fetch(`/api/deals/fetch/${asin}`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        console.log('Raw response status:', response.status);
        const rawText = await response.text();
        console.log('Raw response text:', rawText);

        let parsedData;
        try {
          parsedData = JSON.parse(rawText);
        } catch (parseError) {
          throw new Error('Failed to parse JSON response from server');
        }

        console.log('Parsed data:', parsedData);
        setDeal(parsedData.deal || null);
      } catch (error) {
        console.error('Error fetching deal from DB:', error);
        setDeal(null);
      }
    }

    if (asin) {
      fetchDealFromDB();
    }
  }, [asin]);

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

  // Function to handle affiliate click tracking and redirect
  const handleAffiliateClick = async (asin: string, destination: string) => {
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asin,
          timestamp: new Date().toISOString(),
          page: 'deal',
        }),
      });
    } catch (err) {
      console.error('Failed to track click:', err);
    } finally {
      window.open(destination, '_blank');
    }
  };

  const currentPrice = typeof deal.price === 'string'
    ? parseFloat(deal.price.replace(/[^\d.]/g, ''))
    : deal.price || 0;
  const discountValue = parseFloat(deal?.discount?.replace(/[^\d.]/g, '') || '0');
  const originalPrice = discountValue ? currentPrice / (1 - discountValue / 100) : currentPrice;

  return (
    <div onClick={() => setSuggestions([])}>
      <header className="flex flex-col md:flex-row items-center bg-black h-auto md:h-28 px-4 py-4 shadow w-full justify-between space-y-4 md:space-y-0">
        <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
          <Image src="/chorebazaar-logo.png" alt="ChoreBazaar Logo" width={80} height={80} className="h-20 w-20 object-contain" />
          <div className="ml-4">
            <h1 className="text-4xl font-bold text-white">ChoreBazaar</h1>
            <p className="text-sm md:text-lg lg:text-xl text-gray-300 text-center md:text-left">
              Handpicked Deals. Less Noise. More Value.
            </p>
          </div>
        </div>
        <nav className="flex flex-row space-x-4 md:space-x-8 items-center text-sm md:text-base overflow-x-auto">
          <Link href="/about" className="text-white hover:text-gray-400">About Us</Link>
          <Link href="/terms-and-conditions" className="text-white hover:text-gray-400">Terms & Conditions</Link>
          <Link href="/contact" className="text-white hover:text-gray-400">Contact Us</Link>
        </nav>
      </header>

      <div
        className="flex border border-white w-full mt-4 ml-4 mr-4 px-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          href="/"
          className="flex-1 flex items-center justify-center text-white hover:text-gray-400 text-sm md:text-base py-2 hover:bg-gray-700 active:bg-gray-800 cursor-pointer transition-all duration-200"
        >
          Home
        </Link>

        <div className="relative flex-1">
          <button
            className="flex items-center justify-center text-white text-sm md:text-base py-2 hover:bg-gray-700 active:bg-gray-800 cursor-pointer transition-all duration-200 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            ☰
          </button>
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search anything"
            value={searchQuery}
            onFocus={(e) => {
              e.target.placeholder = '';
              e.target.setSelectionRange(e.target.value.length, e.target.value.length);
            }}
            onBlur={(e) => e.target.placeholder = 'Search anything'}
            onChange={(e) => {
              const query = e.target.value;
              setSearchQuery(query);
              setSelectedSuggestionIndex(-1);
              if (query.trim() === '') {
                setSuggestions([]);
              } else {
                const matches = relatedDeals.filter(deal =>
                  deal.title.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 4);
                setSuggestions(matches);
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
                  window.location.href = `/deals/${suggestions[selectedSuggestionIndex].asin}`;
                } else {
                  window.location.href = `/?query=${encodeURIComponent(searchQuery.trim())}`;
                }
                setSuggestions([]);
              }
            }}
            className="w-full h-full px-4 py-2 bg-transparent text-white text-center hover:bg-gray-700 active:bg-gray-800 cursor-text transition-all duration-200"
          />
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 mt-2 w-full max-h-40 overflow-y-auto text-xs md:text-sm space-y-1 bg-black border border-gray-700 rounded z-50">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.asin}
                  className={`flex items-center cursor-pointer p-1 ${index === selectedSuggestionIndex ? 'bg-gray-600' : ''}`}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  onClick={() => window.location.href = `/deals/${suggestion.asin}`}
                >
                  <Image src={suggestion.image} alt={suggestion.title} width={30} height={30} className="rounded mr-2" />
                  <span className="text-white truncate block w-full">
                    {suggestion.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="min-h-screen bg-black text-white p-2 sm:p-4 flex flex-col items-center">
        <div className="flex flex-col sm:flex-row items-center sm:items-start w-full max-w-4xl mb-6 pl-4">
          <div className="sm:mr-6 mb-4 sm:mb-0 w-full sm:w-auto">
            <Image
              src={deal.image || '/placeholder.png'}
              alt={deal.title || 'Product image'}
              width={300}
              height={225}
              className="rounded w-[300px] h-auto sm:w-[400px] sm:h-auto object-contain"
            />
          </div>
          <div className="flex-1 text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-left">{deal.title}</h1>
            <p className="text-lg mb-2 text-left">Current Price: ₹{deal.price}</p>
            <p className="text-lg mb-2 text-gray-400 text-left">Original Price: ₹{originalPrice.toFixed(2)}</p>
            <p className="text-green-400 mb-4 text-left">Discount: {deal.discount}</p>
            <p className="mb-6 max-w-2xl text-left">{deal.description}</p>
            {deal.link && deal.link.startsWith('http') ? (
              <a
                href={deal.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleAffiliateClick(asin, deal.link)}
              >
                <button
                  className="bg-white text-black px-4 py-2 sm:px-6 sm:py-3 rounded shadow hover:bg-gray-300 transition text-left"
                >
                  Buy on Amazon
                </button>
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

        {/* Footer Disclaimer moved to comprehensive footer below */}

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
                  <Link key={`${item.asin}-${index}`} href={`/deals/${item.asin}`} className="flex-none w-40 sm:w-48 bg-gray-700 rounded p-4 hover:bg-gray-600 transition">
                    <Image src={item.image} alt={item.title} width={160} height={100} className="rounded object-contain w-full h-auto sm:h-auto mx-auto mb-2" />
                    <p className="text-center text-xs sm:text-sm break-words">{item.title}</p>
                  </Link>
                );
              })
            ) : (
              <p className="text-center text-gray-400">No related items found.</p>
            )}
          </div>
        </div>
      </div>
      <footer className="bg-black text-white text-center py-6 text-sm border-t border-gray-700 mt-4">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <p>
            ChoreBazaar is a participant in the Amazon Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in.
          </p>
          <p>
            As an Amazon Associate, we earn from qualifying purchases. Prices and availability are accurate as of the time of display and are subject to change. Product prices and availability on Amazon at the time of purchase will apply to your order.
          </p>
          <p>
            All trademarks, logos, and brand names are the property of their respective owners. All company, product, and service names used on this site are for identification purposes only. Use of these names, trademarks, and brands does not imply endorsement.
          </p>
          <p>
            By using our website, you acknowledge that we may earn a commission if you make a purchase through our affiliate links.
          </p>
          <p className="text-gray-500 text-xs mt-4">
            © {new Date().getFullYear()} ChoreBazaar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
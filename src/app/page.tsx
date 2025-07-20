'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Deal = {
  id: number;
  asin: string;
  title: string;
  price: string;
  discount: string;
  image: string;
  link: string;
  category: string;
  subcategory: string;
  availability?: string;
};

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [itemsToShow, setItemsToShow] = useState<number>(20);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  // Suggestions state for search autocomplete
  const [suggestions, setSuggestions] = useState<Deal[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  // Loading and error state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealsFromAPI = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/deals');
        if (!response.ok) throw new Error('Failed to fetch deals');
        const data = await response.json();
        if (!data || !Array.isArray(data.deals)) throw new Error('Invalid deals data');
        setDeals(data.deals);
        console.log('Fetched deals:', data.deals);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
          console.error('Error fetching deals:', error);
        } else {
          setError('Unknown error');
          console.error('Unexpected error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDealsFromAPI();
  }, []);

  // On mount, extract query param for search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchQuery(query);
      setActiveSearchQuery(query);
    }
  }, []);

  // Infinite scroll: load more items as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setItemsToShow((prev) => prev + 20);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    {
      name: 'Mobiles',
      subcategories: [
        { name: 'Smartphones', subcategories: [] },
        { name: 'Feature Phones', subcategories: [] },
        { name: 'Mobile Accessories', subcategories: [] },
        { name: 'iPhones', subcategories: [] }
      ]
    },
    {
      name: 'Electronics',
      subcategories: [
        { name: 'Laptops', subcategories: [] },
        { name: 'Tablets', subcategories: [] },
        { name: 'Headphones', subcategories: [] },
        { name: 'Cameras', subcategories: [] },
        { name: 'Wearables', subcategories: [] },
        { name: 'Speakers', subcategories: [] },
        { name: 'Television', subcategories: [] },
        { name: 'Smartwatches', subcategories: [] },
        { name: 'Power Banks', subcategories: [] }
      ]
    },
    {
      name: 'Fashion',
      subcategories: [
        { name: 'Men’s Clothing', subcategories: [] },
        { name: 'Women’s Clothing', subcategories: [] },
        { name: 'Footwear', subcategories: [] },
        { name: 'Watches', subcategories: [] },
        { name: 'Bags', subcategories: [] },
        { name: 'Accessories', subcategories: [] }
      ]
    },
    {
      name: 'Beauty & Skin Care',
      subcategories: [
        { name: 'Makeup', subcategories: [] },
        { name: 'Skin & Hair', subcategories: [] },
        { name: 'Fragrances', subcategories: [] },
        { name: 'Bath & Body', subcategories: [] }
      ]
    },
    {
      name: 'Sports & Fitness',
      subcategories: [
        { name: 'Gym Equipment', subcategories: [] },
        { name: 'Fitness Trackers', subcategories: [] },
        { name: 'Sportswear', subcategories: [] },
        { name: 'Outdoor Gear', subcategories: [] },
        { name: 'Yoga Mats', subcategories: [] }
      ]
    },
    {
      name: 'Books',
      subcategories: [
        { name: 'Fiction', subcategories: [] },
        { name: 'Non-Fiction', subcategories: [] },
        { name: 'Academic', subcategories: [] },
        { name: 'Children’s Books', subcategories: [] },
        { name: 'Self-Help', subcategories: [] }
      ]
    },
    {
      name: 'Groceries',
      subcategories: [
        { name: 'Snacks', subcategories: [] },
        { name: 'Beverages', subcategories: [] },
        { name: 'Personal Care', subcategories: [] },
        { name: 'Household Supplies', subcategories: [] },
        { name: 'Fresh Produce', subcategories: [] }
      ]
    },
    {
      name: 'Home & Appliances',
      subcategories: [
        { name: 'Kitchen Appliances', subcategories: [] },
        { name: 'Furniture', subcategories: [] },
        { name: 'Cleaning Supplies', subcategories: [] },
        { name: 'Home Decor', subcategories: [] },
        { name: 'Lighting', subcategories: [] }
      ]
    }
  ];

  // Map "Mobiles & Tablets" category to "Mobiles" and assign "Tablets" to "Electronics & Gadgets" for deals
  const normalizedDeals = deals.map((deal) => {
    if (deal.category === 'Mobiles & Tablets') {
      // If subcategory is Tablets, move to Electronics & Gadgets
      if (deal.subcategory === 'Tablets') {
        return { ...deal, category: 'Electronics & Gadgets' };
      } else {
        return { ...deal, category: 'Mobiles' };
      }
    }
    return deal;
  });




  const handleCategoryClick = (categoryName: string) => {
    if (navigationStack[navigationStack.length - 1] === categoryName) return;
    setNavigationStack((prevStack) => [...prevStack, categoryName]);
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    if (navigationStack[navigationStack.length - 1] === subcategoryName) return;
    setNavigationStack((prevStack) => [...prevStack, subcategoryName]);
    setIsSidebarOpen(false);
  };

  let filteredDeals = normalizedDeals;

  function parseSearchQuery(query: string) {
    const result = {
      searchKeywords: [] as string[],
      minPrice: null as number | null,
      maxPrice: null as number | null,
      minDiscount: null as number | null,
      sortBy: '' as 'priceAsc' | 'priceDesc' | 'discountDesc' | ''
    };

    const lowerQuery = query.toLowerCase();

    // Detect price ranges
    const betweenMatch = lowerQuery.match(/between (\d+) and (\d+)/);
    if (betweenMatch) {
      result.minPrice = parseInt(betweenMatch[1]);
      result.maxPrice = parseInt(betweenMatch[2]);
    }

    const underMatch = lowerQuery.match(/under (\d+)/) || lowerQuery.match(/below (\d+)/) || lowerQuery.match(/less than (\d+)/);
    if (underMatch) {
      result.maxPrice = parseInt(underMatch[1]);
    }

    const aboveMatch = lowerQuery.match(/above (\d+)/) || lowerQuery.match(/over (\d+)/) || lowerQuery.match(/greater than (\d+)/);
    if (aboveMatch) {
      result.minPrice = parseInt(aboveMatch[1]);
    }

    const discountMatch = lowerQuery.match(/minimum discount (\d+)%/) || lowerQuery.match(/discount above (\d+)%/);
    if (discountMatch) {
      result.minDiscount = parseInt(discountMatch[1]);
    }

    if (lowerQuery.includes('max discount')) {
      result.sortBy = 'discountDesc';
    } else if (lowerQuery.includes('sort by price low to high')) {
      result.sortBy = 'priceAsc';
    } else if (lowerQuery.includes('sort by price high to low')) {
      result.sortBy = 'priceDesc';
    }

    const cleanedQuery = lowerQuery
      .replace(/max discount/g, '')
      .replace(/sort by price low to high/g, '')
      .replace(/sort by price high to low/g, '')
      .replace(/under \d+/g, '')
      .replace(/below \d+/g, '')
      .replace(/less than \d+/g, '')
      .replace(/above \d+/g, '')
      .replace(/over \d+/g, '')
      .replace(/greater than \d+/g, '')
      .replace(/between \d+ and \d+/g, '')
      .replace(/minimum discount \d+%/g, '')
      .replace(/discount above \d+%/g, '')
      .trim();

    const keywordList = cleanedQuery.split(/\s+/).filter(Boolean);
    result.searchKeywords = keywordList;

    return result;
  }

  function keywordMatch(dealText: string, keywords: string[]) {
    const synonymMap: { [key: string]: string[] } = {
      men: ["men", "men's", "male", "unisex"],
      women: ["women", "women's", "female", "unisex"],
      kids: ["kids", "children", "child", "kid"],
      black: ["black", "dark"],
      white: ["white", "light"],
      red: ["red"],
      blue: ["blue"],
      green: ["green"],
      shoes: ["shoe", "shoes", "sneakers", "trainers", "footwear"],
      mobiles: ["mobile", "mobiles", "smartphone", "smartphones"],
      electronics: ["electronics", "gadgets", "devices"],
      fashion: ["fashion", "clothing", "apparel", "wear"],
      beauty: ["beauty", "cosmetics", "personal care"],
      appliances: ["appliances", "home appliances"]
    };

    const singularize = (word: string) => word.endsWith('s') ? word.slice(0, -1) : word;

    return keywords.some((keyword) => {
      const cleanKeyword = singularize(keyword);
      if (dealText.includes(cleanKeyword)) return true;

      if (synonymMap[keyword]) {
        return synonymMap[keyword].some((syn) => dealText.includes(singularize(syn)));
      }

      return dealText.split(/\s+/).some((word) => word.startsWith(cleanKeyword));
    });
  }

  if (activeSearchQuery.trim() !== '') {
    const { searchKeywords, minPrice, maxPrice, minDiscount, sortBy } = parseSearchQuery(activeSearchQuery);
    filteredDeals = normalizedDeals.filter((deal) => {
      const priceNumber = parseFloat(deal.price.replace(/[^\d.]/g, '')) || 0;
      const discountNumber = parseFloat(deal.discount.replace('%', '')) || 0;

      const dealText = `${deal.title} ${deal.category} ${deal.subcategory}`.toLowerCase();

      const matchesKeywords = keywordMatch(dealText, searchKeywords);
      const matchesMinPrice = minPrice === null || priceNumber >= minPrice;
      const matchesMaxPrice = maxPrice === null || priceNumber <= maxPrice;
      const matchesMinDiscount = minDiscount === null || discountNumber >= minDiscount;

      return matchesKeywords && matchesMinPrice && matchesMaxPrice && matchesMinDiscount;
    });

    if (sortBy === 'priceAsc') {
      filteredDeals.sort((a, b) => parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, '')));
    } else if (sortBy === 'priceDesc') {
      filteredDeals.sort((a, b) => parseFloat(b.price.replace(/[^\d.]/g, '')) - parseFloat(a.price.replace(/[^\d.]/g, '')));
    } else if (sortBy === 'discountDesc') {
      filteredDeals.sort((a, b) => parseFloat(b.discount.replace('%', '')) - parseFloat(a.discount.replace('%', '')));
    }
  } else {
    // When no search query is active, filter deals based on navigationStack
    if (navigationStack.length === 2) {
      // Apply filtering only when a subcategory is selected
      filteredDeals = normalizedDeals.filter((deal) => {
        return (
          deal.category.trim().toLowerCase() === navigationStack[0].trim().toLowerCase() &&
          deal.subcategory.trim().toLowerCase() === navigationStack[1].trim().toLowerCase()
        );
      });
    } else {
      // Show all deals or no deals when only category is selected
      filteredDeals = normalizedDeals;
    }
  }

  return (
    <div
      className="min-h-screen bg-black flex flex-col text-white px-2 md:px-0"
      onClick={() => {
        setIsSidebarOpen(false);
        setSuggestions([]);
      }}
    >
      {/* Header Section */}
      <header className="flex flex-col md:flex-row items-center bg-black h-auto md:h-28 px-4 py-4 shadow w-full justify-between space-y-4 md:space-y-0">
        {/* Clickable logo and title */}
        <div className="flex items-center cursor-pointer" onClick={() => setNavigationStack([])}>
          <Image src="/chorebazaar-logo.png" alt="ChoreBazaar Logo" width={80} height={80} className="h-20 w-20 object-contain" />
          <div className="ml-4">
            <h1 className="text-4xl font-bold text-white">ChoreBazaar</h1>
            <p className="text-sm md:text-lg lg:text-xl text-gray-300 text-center md:text-left">Handpicked Deals. Less Noise. More Value.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-row space-x-4 md:space-x-8 items-center text-sm md:text-base overflow-x-auto">
          <Link href="/about" className="text-white hover:text-gray-400">About Us</Link>
          <Link href="/terms-and-conditions" className="text-white hover:text-gray-400">Terms & Conditions</Link>
          <Link href="/contact" className="text-white hover:text-gray-400">Contact Us</Link>
        </nav>
      </header>

      {/* Search and hamburger bar always at the top */}
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
        onClick={(e) => {
          e.stopPropagation();
          setIsSidebarOpen(!isSidebarOpen);
        }}
      >
        ☰
      </button>
      {isSidebarOpen && (
        <div
          className="absolute top-full left-0 bg-black shadow-lg border border-white mt-2 transition-all duration-500 ease-in-out z-50 w-full"
        >
          {categories.map((category) => (
            <div key={category.name} className="flex flex-col">
              <button
                onClick={() => handleCategoryClick(category.name)}
                className="flex justify-center items-center w-full px-4 py-3 text-xs font-semibold text-white hover:bg-gray-700 transition-all duration-300"
              >
                {category.name}
                <span className="text-gray-400">{'>'}</span>
              </button>
              {navigationStack.includes(category.name) && (
                <div className="flex flex-col ml-4 overflow-hidden transition-all duration-500 ease-in-out">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.name}
                      onClick={() => handleSubcategoryClick(subcategory.name)}
                      className="flex justify-center items-center w-full px-4 py-3 text-xs font-semibold text-white hover:bg-gray-700 transition-all duration-300"
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
            onBlur={(e) => {
              e.target.placeholder = 'Search anything';
              // Do not clear searchQuery or suggestions here.
            }}
            onChange={(e) => {
              const query = e.target.value;
              setSearchQuery(query);
              setSelectedSuggestionIndex(-1);
              if (query.trim() === '') {
                setSuggestions([]);
              } else {
                const matches = deals.filter(deal =>
                  deal.title.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 4);
                setSuggestions(matches);
              }
              // Only update suggestions, not filtering, until Enter is pressed.
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
                  setActiveSearchQuery(searchQuery);
                  window.history.replaceState(null, '', `/?q=${encodeURIComponent(searchQuery)}`);
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
                  key={suggestion.id}
                  className={`flex items-center cursor-pointer p-1 ${index === selectedSuggestionIndex ? 'bg-gray-600' : ''}`}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  onClick={() => window.location.href = `/deals/${suggestion.asin}`}
                >
                  <Image
                    src={suggestion.image}
                    alt={suggestion.title}
                    width={30}
                    height={30}
                    className="rounded mr-2"
                  />
                  <span className="text-white truncate block w-full">
                    {suggestion.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Inline dropdown for Categories and Subcategories */}
      {/* Deals Section */}
      <div className="flex-1 p-4 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10 mt-8">
        {isLoading ? (
          <p className="text-white text-center w-full mt-20">Loading deals...</p>
        ) : error ? (
          <p className="text-red-500 text-center w-full mt-20">Failed to load deals: {error}</p>
        ) : filteredDeals.length > 0 ? (
          filteredDeals
            .sort((a, b) => {
              const discountA = parseFloat((a.discount ?? '0').replace('%', ''));
              const discountB = parseFloat((b.discount ?? '0').replace('%', ''));
              return discountB - discountA;
            })
            .slice(0, itemsToShow)
            .map((deal) => {
              // Price and discount parsing (robust type handling)
              const dealPrice = typeof deal.price === 'number'
                ? deal.price
                : parseFloat((deal.price ?? '').toString().replace(/[^\d.]/g, '')) || 0;

              const dealDiscount = typeof deal.discount === 'number'
                ? deal.discount
                : parseFloat((deal.discount ?? '').toString().replace(/[^\d.]/g, ''));
              const hasDiscount = !isNaN(dealDiscount) && dealDiscount > 0;
              const originalPrice = dealPrice > 0
                ? dealDiscount && !isNaN(dealDiscount)
                  ? dealPrice / (1 - dealDiscount / 100)
                  : dealPrice
                : 0;

              return (
                <Link
                  key={deal.id ? deal.id.toString() : `${deal.title || 'Untitled'}-${deal.link || Math.random()}`}
                  href={`/deals/${deal.asin}`}
                  className="border border-gray-700 rounded-2xl p-3 md:p-4 lg:p-5 text-center bg-black shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex flex-col cursor-pointer min-h-[320px]"
                >
                  <Image
                    src={deal.image && deal.image.trim() !== '' ? deal.image : '/placeholder.png'}
                    alt={deal.title ? deal.title : 'No Title Available'}
                    width={160}
                    height={160}
                    className="object-contain mx-auto mb-2 w-auto h-40"
                  />
                  <h2 className="text-sm md:text-base lg:text-lg font-semibold w-full break-words min-h-[48px] flex items-center justify-center text-center px-2 whitespace-normal">
                    {deal.title}
                  </h2>
                  <p className="text-gray-400 mt-2 line-through text-xs md:text-sm lg:text-base">
                    ₹{Math.round(originalPrice).toLocaleString('en-IN')}
                  </p>
                  <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold mt-4 mb-2 text-white">
                    ₹{Math.round(dealPrice).toLocaleString('en-IN')}
                  </p>
                  {hasDiscount && (
                    <p className="text-green-400 mt-1 font-semibold text-sm md:text-base lg:text-lg">
                      {Math.round(dealDiscount)}% Off
                    </p>
                  )}
                  {deal.availability && (
                    <p className="text-yellow-400 text-xs mt-1">{deal.availability}</p>
                  )}
                </Link>
              );
            })
        ) : (
          <p className="text-white text-center w-full mt-20">No deals available at the moment.</p>
        )}
      </div>
      {/* Footer Section */}
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
          <p>
            Product prices and availability are accurate as of the time shown and may change. Any price and availability information displayed on Amazon at the time of purchase will apply to your order.
          </p>
          <p className="text-gray-500 text-xs mt-4">
            © {new Date().getFullYear()} ChoreBazaar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
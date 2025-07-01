'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Deal = {
  id: number;
  title: string;
  price: string;
  discount: string;
  image: string;
  link: string;
  category: string;
  subcategory: string;
};

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [itemsToShow, setItemsToShow] = useState<number>(20);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSubcategoryView, setIsSubcategoryView] = useState<boolean>(false);
  // Suggestions state for search autocomplete
  const [suggestions, setSuggestions] = useState<Deal[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);

  useEffect(() => {
    const fetchDealsFromAPI = async () => {
      try {
        const response = await fetch('/api/deals');
        if (!response.ok) throw new Error('Failed to fetch deals');
        const data = await response.json();
        if (!data || !Array.isArray(data.deals)) throw new Error('Invalid deals data');
        setDeals(data.deals);
        console.log('Fetched deals:', data.deals);
      } catch (error) {
        console.error('Error fetching deals:', error);
      }
    };

    fetchDealsFromAPI();
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


  function getCurrentSubcategories() {
    let currentLevel = categories;

    for (const categoryName of navigationStack) {
      const foundCategory = currentLevel.find(cat => cat.name === categoryName);
      if (foundCategory) {
        currentLevel = foundCategory.subcategories;
      } else {
        currentLevel = [];
        break;
      }
    }

    return currentLevel;
  }

  const subcategories = getCurrentSubcategories();

  const handleCategoryClick = (categoryName: string) => {
    if (navigationStack[navigationStack.length - 1] === categoryName) return;
    setNavigationStack((prevStack) => [...prevStack, categoryName]);
    setIsSubcategoryView(true);
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    if (navigationStack[navigationStack.length - 1] === subcategoryName) return;
    setNavigationStack((prevStack) => [...prevStack, subcategoryName]);
    setIsSubcategoryView(false);
    setIsSidebarOpen(false);
  };

  const handleGoBack = () => {
    setNavigationStack((prevStack) => {
      const newStack = prevStack.slice(0, -1);
      if (newStack.length <= 1) setIsSidebarOpen(false);
      return newStack;
    });
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
        onClick={() => setIsSidebarOpen(false)}
      >
      {/* Header Section */}
      <header className="flex flex-col md:flex-row items-center bg-black h-auto md:h-28 px-4 py-4 shadow w-full justify-between space-y-4 md:space-y-0">
        {/* Clickable logo and title */}
        <div className="flex items-center cursor-pointer" onClick={() => setNavigationStack([])}>
          <Image src="/chorebazaar-logo.png" alt="ChoreBazaar Logo" width={80} height={80} className="h-20 w-20 object-contain" />
          <div className="ml-4">
            <h1 className="text-4xl font-bold text-white">ChoreBazaar</h1>
            <p className="text-lg text-gray-300">Handpicked Deals. Less Noise. More Value.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8 items-center">
          <Link href="/" className="text-white hover:text-gray-400">Home</Link>
          <Link href="/about" className="text-white hover:text-gray-400">About Us</Link>
          <Link href="/terms-and-conditions" className="text-white hover:text-gray-400">Terms & Conditions</Link>
          <Link href="/contact" className="text-white hover:text-gray-400">Contact Us</Link>
        </nav>
      </header>

      {/* Search and hamburger bar always at the top */}
      <div className="flex items-center justify-between mt-4 ml-4 mr-4 relative">
        <button
          className="text-white text-2xl mr-4"
          onClick={(e) => {
            e.stopPropagation();
            setTimeout(() => setIsSidebarOpen(!isSidebarOpen), 50);
          }}
        >
          ☰
        </button>
        <input
          type="text"
          placeholder="Search anything"
          value={searchQuery}
          onFocus={(e) => e.target.placeholder = ''}
          onBlur={(e) => e.target.placeholder = 'Search anything'}
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
                setActiveSearchQuery(searchQuery);
              }
              setSuggestions([]);
            }
          }}
          className="px-4 py-2 rounded-full bg-transparent text-white w-80 border border-white"
        />
        {suggestions && suggestions.length > 0 && (
          <div className="absolute mt-12 bg-black border border-gray-700 rounded w-80 z-50">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={`p-2 cursor-pointer flex items-center ${index === selectedSuggestionIndex ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
                onClick={() => window.location.href = `/deals/${suggestion.id}`}
              >
                <Image
                  src={suggestion.image && suggestion.image.trim() !== '' ? suggestion.image : '/placeholder.png'}
                  alt={suggestion.title}
                  width={40}
                  height={40}
                  className="rounded object-cover mr-2"
                />
                {suggestion.title}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1">
        {/* Sidebar with Categories and Subcategories as overlay */}
        {isSidebarOpen && (
          <div
            className={`fixed top-0 left-0 w-64 h-full bg-black shadow-lg overflow-y-auto z-50 p-4 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white mb-4">Categories</h2>
            {/* Category Section */}
            <div className={`flex flex-col gap-1 mt-6 transform transition-transform duration-300 ${isSubcategoryView ? '-translate-x-full' : 'translate-x-0'}`}>
              {!isSubcategoryView && (
                categories.map((category) => (
                  <div key={category.name}>
                    <button
                      onClick={() => handleCategoryClick(category.name)}
                      className="flex justify-between items-center w-full px-4 py-3 text-xs font-semibold text-white hover:bg-gray-700 transition"
                    >
                      {category.name}
                      <span className="text-gray-400">{'>'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
            {/* Subcategory Section */}
            {navigationStack.length > 0 && (
              <div className={`flex flex-col gap-1 pl-0 absolute top-0 left-0 w-full h-full bg-black transition-transform duration-300 ${isSubcategoryView ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="mt-6">
                  {/* Back button */}
                  <button
                    onClick={handleGoBack}
                    className="text-sm text-gray-400 hover:text-white mb-4 flex items-center"
                  >
                    <span className="mr-2">{'<'}</span> Back to {navigationStack.length > 1 ? navigationStack[navigationStack.length - 2] : 'All Categories'}
                  </button>
                  {/* Current category display */}
                  <div className="pl-4 mb-4">
                    <h3 className="text-lg font-bold text-white">{navigationStack[navigationStack.length - 1]}</h3>
                  </div>
                  {/* Subcategories section */}
                  <div className={`flex flex-col gap-1 pl-6 transform transition-transform duration-300 ${isSubcategoryView ? 'translate-x-0' : 'translate-x-full'}`}>
                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory.name}
                        onClick={() => handleSubcategoryClick(subcategory.name)}
                        className="flex justify-between items-center w-full px-4 py-3 text-xs font-semibold text-white hover:bg-gray-700 transition"
                      >
                        {subcategory.name}
                        <span className="text-gray-400">{'>'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Deals Section */}
        <div className="flex-1 p-4 md:p-8 flex flex-wrap justify-start gap-10 mt-8">
          {filteredDeals.length > 0 ? (
            filteredDeals.slice(0, itemsToShow).map((deal) => {
              // Ensure price is a valid number
              const priceValue = deal.price && !isNaN(Number(deal.price.toString().replace(/[^\d.]/g, '')))
                ? deal.price.toString().replace(/[^\d.]/g, '')
                : '0';
              const currentPrice = parseFloat(priceValue) || 0;

              // Ensure discount is a valid number
              const discountString = deal.discount && !isNaN(Number(deal.discount.toString().replace(/[^\d.]/g, '')))
                ? deal.discount.toString().replace(/[^\d.]/g, '')
                : '0';
              const discountPercent = parseFloat(discountString) || 0;

              // Calculate original price safely
              const originalPrice = discountPercent > 0 && currentPrice > 0 ? (currentPrice / (1 - discountPercent / 100)) : 0;

              return (
                <Link
                  key={deal.id ? deal.id.toString() : `${deal.title || 'Untitled'}-${deal.link || Math.random()}`}
                  href={`/deals/${deal.id}`}
                  className="border border-gray-700 rounded-2xl p-3 text-center bg-black shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex flex-col cursor-pointer"
                  style={{ minHeight: 320, width: 200 }}
                >
                  <Image
                    src={deal.image && deal.image.trim() !== '' ? deal.image : '/placeholder.png'}
                    alt={deal.title ? deal.title : 'No Title Available'}
                    width={120}
                    height={80}
                    className="rounded object-cover mx-auto mb-2"
                  />
                  <h2 className="text-lg font-semibold w-full break-words min-h-[48px] flex items-center justify-center text-center px-2">
                    {deal.title.length > 20 ? `${deal.title.slice(0, 20)}...` : deal.title}
                  </h2>
                  <p className="text-gray-400 mt-2">
                    Original: ₹{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </p>
                  <p className="text-xl font-bold mt-2 text-white">
                    ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </p>
                  <p className="text-green-400 mt-1 font-semibold">
                    {deal.discount} Off
                  </p>
                </Link>
              );
            })
          ) : (
            <p className="text-white text-center w-full mt-20">No deals available at the moment.</p>
          )}
        </div>
      </div>
      {/* Footer Section */}
      <footer className="bg-black text-white text-center py-4 text-sm border-t border-gray-700 mt-4">
        Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
      </footer>
    </div>
  );
}
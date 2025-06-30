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

  // Expanded nested category structure
  const categories = [
    {
      name: 'Mobiles',
      subcategories: [
        {
          name: 'Smartphones',
          subcategories: [
            {
              name: 'Android Phones',
              subcategories: [
                { name: 'By Discount', subcategories: [] },
                { name: 'By Price', subcategories: [] },
                { name: 'By Brand', subcategories: [] }
              ]
            },
            {
              name: 'iPhones',
              subcategories: [
                { name: 'By Discount', subcategories: [] },
                { name: 'By Price', subcategories: [] },
                { name: 'By Brand', subcategories: [] }
              ]
            }
          ]
        },
        { name: 'Accessories', subcategories: [] },
        { name: 'Feature Phones', subcategories: [] }
      ]
    },
    {
      name: 'Electronics & Gadgets',
      subcategories: [
        { name: 'Tablets', subcategories: [] },
        {
          name: 'Headphones',
          subcategories: [
            { name: 'By Discount', subcategories: [] },
            { name: 'By Price', subcategories: [] },
            { name: 'By Brand', subcategories: [] }
          ]
        },
        {
          name: 'Cameras',
          subcategories: [
            { name: 'DSLR', subcategories: [] },
            { name: 'Mirrorless', subcategories: [] },
            { name: 'By Price', subcategories: [] }
          ]
        }
      ]
    },
    {
      name: 'Beauty & Personal Care',
      subcategories: [
        {
          name: 'Makeup',
          subcategories: [
            { name: 'Face', subcategories: [] },
            { name: 'Eyes', subcategories: [] },
            { name: 'Lips', subcategories: [] }
          ]
        },
        {
          name: 'Skincare',
          subcategories: [
            { name: 'Moisturizers', subcategories: [] },
            { name: 'Cleansers', subcategories: [] },
            { name: 'Serums', subcategories: [] }
          ]
        }
      ]
    },
    {
      name: 'Fashion & Apparel',
      subcategories: [
        {
          name: 'Men',
          subcategories: [
            { name: 'Shoes', subcategories: [] },
            { name: 'Clothing', subcategories: [] },
            { name: 'Accessories', subcategories: [] }
          ]
        },
        {
          name: 'Women',
          subcategories: [
            { name: 'Shoes', subcategories: [] },
            { name: 'Clothing', subcategories: [] },
            { name: 'Accessories', subcategories: [] }
          ]
        },
        {
          name: 'Kids',
          subcategories: [
            { name: 'Toys', subcategories: [] },
            { name: 'Shoes', subcategories: [] },
            { name: 'Clothing', subcategories: [] }
          ]
        }
      ]
    },
    {
      name: 'Home Appliances',
      subcategories: [
        {
          name: 'Kitchen Appliances',
          subcategories: [
            { name: 'Microwaves', subcategories: [] },
            { name: 'Coffee Makers', subcategories: [] },
            { name: 'Air Fryers', subcategories: [] }
          ]
        },
        {
          name: 'Vacuum Cleaners',
          subcategories: [
            { name: 'Robotic', subcategories: [] },
            { name: 'Handheld', subcategories: [] }
          ]
        }
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

  const selectedCategory = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;

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
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    if (navigationStack[navigationStack.length - 1] === subcategoryName) return;
    setNavigationStack((prevStack) => [...prevStack, subcategoryName]);
  };

  const handleGoBack = () => {
    setNavigationStack((prevStack) => prevStack.slice(0, -1));
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
    filteredDeals = normalizedDeals.filter((deal) => {
      const categoryMatch = selectedCategory ? deal.category === selectedCategory : true;
      const subcategoryMatch = navigationStack.length > 1 ? deal.subcategory === navigationStack[navigationStack.length - 1] : true;
      return categoryMatch && subcategoryMatch;
    });
  }

  return (
    <div className="min-h-screen bg-black flex flex-col text-white px-2 md:px-0">
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
      <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mt-8">
        <button className="text-white hover:text-gray-400 bg-transparent border border-white px-8 py-4 rounded-full hover:bg-gray-700 transition text-lg">
          Top Deals
        </button>
        <button className="text-white hover:text-gray-400 bg-transparent border border-white px-8 py-4 rounded-full hover:bg-gray-700 transition text-lg">
          Bestsellers
        </button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar with Categories and Subcategories */}
        <div className="w-full md:w-64 p-4 bg-black shadow mt-8">
          <input
            type="text"
            placeholder="Search anything"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setActiveSearchQuery(searchQuery);
              }
            }}
            className="w-full p-2 mb-4 text-white placeholder-white bg-black border border-white rounded-full"
          />
          <h2 className="text-lg font-bold text-white mb-4">Categories</h2>
          
          {navigationStack.length > 0 ? (
            <div className="flex flex-col gap-1 mt-6">
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
              <div className="flex flex-col gap-1 pl-6">
                {subcategories.map((subcategory) => (
                  <button
                    key={subcategory.name}
                    onClick={() => handleSubcategoryClick(subcategory.name)}
                    className="flex justify-between items-center w-full px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition"
                  >
                    {subcategory.name}
                    <span className="text-gray-400">{'>'}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 mt-6">
              {categories.map((category) => (
                <div key={category.name}>
                  <button
                    onClick={() => handleCategoryClick(category.name)}
                    className="flex justify-between items-center w-full px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition"
                  >
                    {category.name}
                    <span className="text-gray-400">{'>'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deals Section */}
        <div className="flex-1 p-4 md:p-8 flex flex-wrap justify-center gap-10 mt-8">
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
                <div
                  key={deal.id ? deal.id.toString() : `${deal.title || 'Untitled'}-${deal.link || Math.random()}`}
                  className="border border-gray-700 rounded-2xl p-5 text-center bg-black shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex flex-col mx-auto"
                  style={{ minHeight: 420, width: 300 }}
                >
                  <Image
                    src={deal.image && deal.image.trim() !== '' ? deal.image : '/placeholder.png'}
                    alt={deal.title ? deal.title : 'No Title Available'}
                    width={160}
                    height={100}
                    className="rounded object-cover mx-auto mb-2"
                  />
                  <h2 className="text-lg font-semibold w-full break-words min-h-[48px] flex items-center justify-center text-center px-2">
                    {deal.title}
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
                  <Link
                    href={`/deals/${deal.id}`}
                    className="inline-block mt-auto px-5 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition transform hover:scale-105 active:translate-y-1 active:shadow-inner shadow"
                    style={{ minWidth: 120 }}
                  >
                    View Deal
                  </Link>
                </div>
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
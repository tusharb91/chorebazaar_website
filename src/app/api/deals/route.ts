import { NextResponse } from 'next/server';
import Papa from 'papaparse';

interface Deal {
  Title?: string;
  Price?: string;
  Discount?: string;
  Image?: string;
  Link?: string;
  Platform?: string;
  Category?: string;
  Subcategory?: string;
  Description?: string;
}

async function fetchDealsFromGoogleSheet() {
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSoBg7znhoq1MoPT3wOQRjWx0uHHONm4c1UrSj0vplgWbsQWcZMZd0FC8KpyWoSd2kXlWjHvqey5Cdf/pub?output=csv';

  try {
    const response = await fetch(sheetUrl);
    if (!response.ok) {
      console.error('Failed to fetch Google Sheet:', response.statusText);
      return [];
    }

    const csvText = await response.text();
    console.log('Fetched CSV Text:', csvText);

    const parsedData = Papa.parse(csvText, { header: true });
    console.log('Parsed Data:', parsedData.data);

    if (parsedData.errors.length) {
      console.error('CSV Parsing Errors:', parsedData.errors);
      return [];
    }

    const deals = parsedData.data.map((deal: Deal, index: number) => ({
      id: `deal-${index + 1}`,
      title: deal.Title?.trim() || 'No Title',
      price: deal.Price?.trim() || 'No Price',
      discount: deal.Discount?.trim() || 'No Discount',
      image: deal.Image?.trim() || '',
      link: deal.Link?.trim() || '#',
      platform: deal.Platform?.trim() || 'Unknown',
      category: deal.Category?.trim() || 'General',
      subcategory: deal.Subcategory?.trim() || 'General',
      description: deal.Description?.trim() || 'No Description Available'
    }));
    console.log('Deals Array:', deals);

    return deals;
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    return [];
  }
}

export async function GET() {
  const deals = await fetchDealsFromGoogleSheet();
  return NextResponse.json({ deals });
}
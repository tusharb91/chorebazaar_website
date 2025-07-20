import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../data/productlist.json');

// Type for an entry in the product list
export interface ProductListEntry {
  asin: string;
  category: string;
}

// Read the list of products from the JSON file
export function readProductList(): ProductListEntry[] {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as ProductListEntry[];
  } catch (error) {
    console.error('Error reading product list:', error);
    return [];
  }
}

// Write a new list to the JSON file
export function writeProductList(products: ProductListEntry[]): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing product list:', error);
  }
}

// Add a new product if it doesn’t already exist
export function addProduct(newProduct: ProductListEntry): void {
  const currentList = readProductList();
  const exists = currentList.some(p => p.asin === newProduct.asin);
  if (!exists) {
    currentList.push(newProduct);
    writeProductList(currentList);
  }
}

// Remove a product by ASIN
export function removeProduct(asin: string): void {
  const currentList = readProductList();
  const updatedList = currentList.filter(p => p.asin !== asin);
  writeProductList(updatedList);
}
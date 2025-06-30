import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    console.log('API hit');

    const filePath = path.join(process.cwd(), 'public', 'deals.csv');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const readCSV = () =>
      new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            reject(err);
            return;
          }

          const lines = data.trim().split('\n');
          const headers = lines[0].split(',').map((header) => header.trim());

          const deals = lines.slice(1).map((line, index) => {
            const values = line.split(',').map((value) => value.trim());
            return {
              id: values[0] || `deal-${index + 1}`,
              title: values[1] || '',
              price: values[2] || '',
              discount: values[3] || '',
              image: values[4] || '',
              link: values[5] || '',
              category: values[6] || '',
              subcategory: values[7] || '',
            };
          });

          resolve(deals);
        });
      });

    const deals: any[] = await readCSV() as any[];

    return NextResponse.json({ deals: deals });
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
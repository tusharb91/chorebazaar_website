// src/components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/">
        <h1 className="text-2xl font-bold cursor-pointer">ChoreBazaar</h1>
      </Link>
      <nav className="space-x-6">
        <Link href="/best-deals" className="hover:underline">Best Deals</Link>
        <Link href="/bestsellers" className="hover:underline">Bestsellers</Link>
      </nav>
    </header>
  );
}
import Link from 'next/link';
export default function Header() {
  return (
    <header className="bg-black p-4 flex justify-center items-center">
      <nav className="flex space-x-8">
        <Link href="/" className="text-white hover:text-gray-400">
          Home
        </Link>
        <Link href="/about" className="text-white hover:text-gray-400">
          About Us
        </Link>
        <Link href="/terms-and-conditions" className="text-white hover:text-gray-400">
          Terms & Conditions
        </Link>
        <Link href="/contact" className="text-white hover:text-gray-400">
          Contact Us
        </Link>
      </nav>
    </header>
  );
}
export default function Header() {
  return (
    <header className="bg-black p-4 flex justify-center items-center">
      <nav className="flex space-x-8">
        <a href="/" className="text-white hover:text-gray-400">
          Home
        </a>
        <a href="/about" className="text-white hover:text-gray-400">
          About Us
        </a>
        <a href="/terms-and-conditions" className="text-white hover:text-gray-400">
          Terms & Conditions
        </a>
        <a href="/contact" className="text-white hover:text-gray-400">
          Contact Us
        </a>
      </nav>
    </header>
  );
}
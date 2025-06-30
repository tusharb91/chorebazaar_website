'use client';
import Image from 'next/image';

export default function TermsAndConditions() {
  return (
    <>
      <header className="flex items-center bg-black h-28 px-4 py-0 shadow w-full justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
          <Image src="/chorebazaar-logo.png" alt="ChoreBazaar Logo" width={112} height={112} className="h-full w-auto object-contain" />
          <div className="ml-4">
            <h1 className="text-4xl font-bold text-white">ChoreBazaar</h1>
            <p className="text-lg text-gray-300">Handpicked Deals. Less Noise. More Value.</p>
          </div>
        </div>

        <nav className="flex space-x-8">
          <a href="/" className="text-white hover:text-gray-400">Home</a>
          <a href="/about" className="text-white hover:text-gray-400">About Us</a>
          <a href="/terms-and-conditions" className="text-white hover:text-gray-400">Terms & Conditions</a>
          <a href="/contact" className="text-white hover:text-gray-400">Contact Us</a>
        </nav>
      </header>

      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
        <ul className="list-disc list-inside mb-4">
          <li>ChoreBazaar provides affiliate links to Amazon and other partner websites.</li>
          <li>We are not responsible for the products, shipping, or services provided by these third-party sellers.</li>
          <li>Prices and availability are subject to change and may not always be updated in real-time.</li>
          <li>We reserve the right to modify or remove content without prior notice.</li>
        </ul>
        <p className="mb-4 font-semibold">Affiliate Disclaimer:</p>
        <p className="mb-4">
          As an Amazon Associate, we earn from qualifying purchases. ChoreBazaar may also earn commissions from other affiliate programs.
        </p>
        <p>For questions regarding these terms, please contact us at <strong>support@chorebazaar.com</strong>.</p>
      </div>
    </>
  );
}
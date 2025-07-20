'use client';
import Image from 'next/image';
import Link from 'next/link';

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
          <Link href="/" className="text-white hover:text-gray-400">Home</Link>
          <Link href="/about" className="text-white hover:text-gray-400">About Us</Link>
          <Link href="/terms-and-conditions" className="text-white hover:text-gray-400">Terms & Conditions</Link>
          <Link href="/contact" className="text-white hover:text-gray-400">Contact Us</Link>
        </nav>
      </header>

      <div className="min-h-screen bg-black flex justify-center items-start py-12 px-4">
        <div className="bg-black text-white max-w-3xl w-full p-8 rounded-lg shadow-lg border border-white">
          <h1 className="text-4xl font-bold mb-4 text-white">Terms & Conditions</h1>

          <h2 className="text-2xl font-semibold mb-2 text-white">Affiliate Disclosure:</h2>
          <p className="mb-4 text-gray-300 leading-relaxed">
            ChoreBazaar participates in the Amazon Associates Program and other affiliate marketing programs. As an Amazon Associate, we earn from qualifying purchases. When you click on affiliate links and make purchases, we may earn a commission at no additional cost to you.
          </p>

          <h2 className="text-2xl font-semibold mb-2 text-white">Third-Party Responsibility:</h2>
          <ul className="list-disc list-inside mb-4">
            <li className="text-gray-300 leading-relaxed">ChoreBazaar provides affiliate links to Amazon and other partner websites.</li>
            <li className="text-gray-300 leading-relaxed">We are not responsible for the products, shipping, warranties, customer service, or any transaction made on these third-party websites.</li>
            <li className="text-gray-300 leading-relaxed">All product purchases are subject to the terms and policies of the third-party seller, including Amazon’s own terms of service.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-2 text-white">Accuracy of Information:</h2>
          <ul className="list-disc list-inside mb-4">
            <li className="text-gray-300 leading-relaxed">Prices, discounts, and availability are subject to change without notice.</li>
            <li className="text-gray-300 leading-relaxed">While we strive to keep information accurate, we make no guarantees that the listed prices, discounts, or availability are always current.</li>
            <li className="text-gray-300 leading-relaxed">Product prices and availability shown on Amazon at the time of purchase will apply to your purchase.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-2 text-white">Cookie Policy:</h2>
          <p className="mb-4 text-gray-300 leading-relaxed">
            ChoreBazaar and our third-party partners, including Amazon, may use cookies to track clicks and purchases for affiliate commissions. By using this site, you consent to the use of cookies in accordance with our Privacy Policy.
          </p>

          <h2 className="text-2xl font-semibold mb-2 text-white">User Data:</h2>
          <p className="mb-4 text-gray-300 leading-relaxed">
            We do not collect personal information directly. However, Amazon and other partners may track your activity as part of their own privacy policies and tracking systems. Please review our Privacy Policy for more details.
          </p>

          <h2 className="text-2xl font-semibold mb-2 text-white">Modification of Terms:</h2>
          <p className="mb-4 text-gray-300 leading-relaxed">
            ChoreBazaar reserves the right to modify, update, or remove these terms at any time without prior notice. It is your responsibility to review this page periodically for any changes.
          </p>

          <h2 className="text-2xl font-semibold mb-2 text-white">Prohibited Activities:</h2>
          <ul className="list-disc list-inside mb-4">
            <li className="text-gray-300 leading-relaxed">Self-purchasing through affiliate links is strictly prohibited.</li>
            <li className="text-gray-300 leading-relaxed">No incentives, cashback, or rewards are provided for using our affiliate links.</li>
            <li className="text-gray-300 leading-relaxed">No prohibited paid search placements using Amazon trademarks are allowed.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-2 text-white">Limitation of Liability:</h2>
          <p className="mb-4 text-gray-300 leading-relaxed">
            ChoreBazaar will not be liable for any direct, indirect, incidental, or consequential damages related to your use of this website or third-party websites accessed via affiliate links.
          </p>

          <h2 className="text-2xl font-semibold mb-2 text-white">Contact:</h2>
          <p className="mb-4 text-gray-300 leading-relaxed">
            If you have any questions regarding these Terms and Conditions, please contact us at <strong>support@chorebazaar.com</strong>.
          </p>
        </div>
      </div>
    </>
  );
}
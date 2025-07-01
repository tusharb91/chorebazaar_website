import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import Image from 'next/image';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChoreBazaar - Find the Best Deals",
  description: " discover top Amazon deals quickly and efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/logo.png" alt="ChoreBazaar Logo" width={40} height={40} style={{ marginRight: '10px' }} />
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'black' }}>ChoreBazaar</h1>
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}

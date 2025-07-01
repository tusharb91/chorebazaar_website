import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.png" alt="ChoreBazaar Logo" style={{ height: '40px', marginRight: '10px' }} />
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'black' }}>ChoreBazaar</h1>
          </a>
        </header>
        {children}
      </body>
    </html>
  );
}

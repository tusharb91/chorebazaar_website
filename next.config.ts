import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images-na.ssl-images-amazon.com',
      'm.media-amazon.com',
      'rukminim1.flixcart.com',
      'lh3.googleusercontent.com',
      'imgur.com',
      'res.cloudinary.com',
      'via.placeholder.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },
};
export default nextConfig;

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Video Downloader - Download Videos from YouTube, YouTube Shorts, Instagram, TikTok, Twitter",
  description: "Download videos for free from YouTube, YouTube Shorts, Instagram, TikTok, Twitter/X, and more. Fast, free, and easy-to-use video downloader. No registration required.",
  keywords: "video downloader, youtube downloader, youtube shorts downloader, instagram video downloader, tiktok downloader, twitter video downloader, free video download",
  authors: [{ name: "Video Downloader" }],
  openGraph: {
    title: "Free Video Downloader - Download Videos from Any Platform",
    description: "Download videos for free from YouTube, YouTube Shorts, Instagram, TikTok, Twitter/X, and more. Fast and easy-to-use.",
    url: "https://videodownloader.com",
    siteName: "Video Downloader",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Video Downloader",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Downloader - Download Videos from Any Platform",
    description: "Download videos for free from YouTube, Instagram, TikTok, Twitter/X, and more.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://videodownloader.com",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Video Downloader",
              "description": "Free online video downloader for YouTube, Instagram, TikTok, Twitter and more",
              "url": "https://videodownloader.com",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250",
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}


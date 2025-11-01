"use client";

import { useState } from "react";
import VideoDownloader from "@/components/VideoDownloader";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Free Video Downloader
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-2">
            Download videos from YouTube, YouTube Shorts, Instagram, TikTok, Twitter & more
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Fast, free, and easy-to-use. No registration required.
          </p>
        </div>

        <VideoDownloader />

        <section className="mt-20 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
            Supported Platforms
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { name: "YouTube & Shorts", icon: "▶️", color: "from-red-500 to-red-600" },
              { name: "Instagram", icon: "📷", color: "from-purple-500 to-pink-600" },
              { name: "TikTok", icon: "🎵", color: "from-black to-gray-800" },
              { name: "Twitter/X", icon: "🐦", color: "from-blue-400 to-blue-500" },
            ].map((platform) => (
              <div
                key={platform.name}
                className={`bg-gradient-to-br ${platform.color} rounded-xl p-6 text-white text-center transform hover:scale-105 transition-transform shadow-lg`}
              >
                <div className="text-4xl mb-2">{platform.icon}</div>
                <div className="font-semibold">{platform.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Paste Video URL",
                description: "Copy the video link from YouTube, YouTube Shorts, Instagram, TikTok, or Twitter",
              },
              {
                step: "2",
                title: "Click Download",
                description: "Our system will process and prepare your video for download",
              },
              {
                step: "3",
                title: "Save Video",
                description: "Download your video in the best available quality",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Is this service free?",
                a: "Yes, our video downloader is completely free to use with no hidden fees or registration required.",
              },
              {
                q: "What video formats are supported?",
                a: "We support MP4, WEBM, and other common video formats. The format depends on the source platform.",
              },
              {
                q: "Can I download videos on mobile?",
                a: "Yes, our website is fully responsive and works on all devices including smartphones and tablets.",
              },
              {
                q: "Are downloaded videos watermarked?",
                a: "No, we don't add any watermarks. Videos are downloaded in their original quality from the source.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {faq.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}


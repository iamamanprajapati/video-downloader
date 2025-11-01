"use client";

import { useState } from "react";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  formats: Array<{
    quality: string;
    url: string;
    format: string;
  }>;
}

export default function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  const detectPlatform = (url: string): string => {
    if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("youtube.com/shorts/")) return "youtube";
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("tiktok.com")) return "tiktok";
    if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
    return "unknown";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVideoInfo(null);

    if (!url.trim()) {
      setError("Please enter a video URL");
      return;
    }

    const platform = detectPlatform(url);
    if (platform === "unknown" || !url.includes("http")) {
      setError("Please enter a valid video URL from YouTube (including Shorts), Instagram, TikTok, or Twitter");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to fetch video information";
        console.error("API Error:", errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.formats || data.formats.length === 0) {
        throw new Error("No downloadable formats found for this video");
      }

      // Sort formats by quality (highest first)
      data.formats.sort((a: any, b: any) => {
        const getHeight = (quality: string) => {
          const match = quality.match(/(\d+)p/);
          return match ? parseInt(match[1]) : 0;
        };
        return getHeight(b.quality) - getHeight(a.quality);
      });

      setVideoInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (downloadUrl: string, filename: string) => {
    // If it's already a full URL (starts with http), use it directly
    // Otherwise, it's a relative URL from our API
    if (downloadUrl.startsWith("http")) {
      // For external URLs, we need to use the proxy
      window.open(downloadUrl, "_blank");
    } else {
      // For our proxy URLs, trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="video-url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Enter Video URL
            </label>
            <div className="flex gap-4">
              <input
                id="video-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or youtube.com/shorts/..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? "Processing..." : "Download"}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {videoInfo && (
          <div className="mt-8 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full md:w-64 h-48 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {videoInfo.title}
                  </h3>
                  {videoInfo.duration && (
                    <p className="text-gray-600 dark:text-gray-400">
                      Duration: {videoInfo.duration}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Available Formats
              </h4>
              <div className="grid gap-4">
                {videoInfo.formats.map((format, idx) => {
                  const isHighestQuality = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-lg p-4 transition-colors ${
                        isHighestQuality
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-500 dark:border-blue-400"
                          : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isHighestQuality && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                            BEST
                          </span>
                        )}
                        <div>
                          <span className={`font-medium ${isHighestQuality ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-gray-200"}`}>
                            {format.quality}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            ({format.format})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDownload(format.url, `${videoInfo.title}-${format.quality}.${format.format}`)
                        }
                        className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                          isHighestQuality
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        Download
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


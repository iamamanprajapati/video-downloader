import { NextRequest, NextResponse } from "next/server";

interface VideoInfo {
  title: string;
  thumbnail?: string;
  duration?: string;
  formats: Array<{
    quality: string;
    url: string;
    format: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Invalid URL provided" },
        { status: 400 }
      );
    }

    // Detect platform
    let platform = "unknown";
    if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("youtube.com/shorts/")) {
      platform = "youtube";
    } else if (url.includes("instagram.com")) {
      platform = "instagram";
    } else if (url.includes("tiktok.com")) {
      platform = "tiktok";
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      platform = "twitter";
    }

    if (platform === "unknown") {
      return NextResponse.json(
        { error: "Unsupported platform. Please use YouTube (including Shorts), Instagram, TikTok, or Twitter/X." },
        { status: 400 }
      );
    }

    // Process based on platform
    let videoInfo: VideoInfo;

    switch (platform) {
      case "youtube":
        videoInfo = await downloadYouTube(url);
        break;
      case "instagram":
        videoInfo = await downloadInstagram(url);
        break;
      case "tiktok":
        videoInfo = await downloadTikTok(url);
        break;
      case "twitter":
        videoInfo = await downloadTwitter(url);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported platform" },
          { status: 400 }
        );
    }

    return NextResponse.json(videoInfo);
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process video. Please try again.",
      },
      { status: 500 }
    );
  }
}

async function downloadYouTube(url: string): Promise<VideoInfo> {
  try {
    // Dynamic import for server-side only
    const ytdlModule = await import("@distube/ytdl-core");
    
    // Extract video ID - handles regular videos, shorts, and short URLs
    let videoId = "";
    
    // Handle YouTube Shorts: youtube.com/shorts/VIDEO_ID
    if (url.includes("youtube.com/shorts/")) {
      const match = url.match(/shorts\/([a-zA-Z0-9_-]+)/);
      videoId = match ? match[1] : "";
    }
    // Handle short URLs: youtu.be/VIDEO_ID
    else if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/")[1];
      videoId = parts ? parts.split("?")[0].split("&")[0].split("/")[0] : "";
    }
    // Handle regular URLs: youtube.com/watch?v=VIDEO_ID
    else {
      const match = url.match(/[?&]v=([^&]+)/);
      videoId = match ? match[1] : "";
    }

    if (!videoId) {
      throw new Error("Invalid YouTube URL. Please check the video link. Supported formats: youtube.com/watch?v=..., youtube.com/shorts/..., or youtu.be/...");
    }

    // Get video info - try different import methods
    let info;
    try {
      // Try as default export first
      if (typeof (ytdlModule as any).default?.getInfo === 'function') {
        info = await (ytdlModule as any).default.getInfo(videoId);
      } 
      // Try as named export
      else if (typeof (ytdlModule as any).getInfo === 'function') {
        info = await (ytdlModule as any).getInfo(videoId);
      }
      // Try accessing the module directly
      else {
        const ytdl = ytdlModule as any;
        info = await ytdl.getInfo(videoId);
      }
    } catch (getInfoError: any) {
      console.error("Error getting video info:", getInfoError);
      const errorMessage = getInfoError?.message || getInfoError?.toString() || "Unknown error";
      throw new Error(`Failed to get video information: ${errorMessage}. Please make sure the video is publicly accessible.`);
    }

    // Get available formats - prioritize high quality
    let chooseFormatFn;
    if (typeof (ytdlModule as any).default?.chooseFormat === 'function') {
      chooseFormatFn = (ytdlModule as any).default.chooseFormat;
    } else if (typeof (ytdlModule as any).chooseFormat === 'function') {
      chooseFormatFn = (ytdlModule as any).chooseFormat;
    }

    let formats: Array<{ quality: string; url: string; format: string }> = [];

    // First, try to get the highest quality combined format (video + audio)
    if (chooseFormatFn) {
      try {
        // Try to get best quality with video and audio combined
        const bestCombined = chooseFormatFn(info.formats, {
          quality: "highest",
          filter: "videoandaudio",
        });
        if (bestCombined && bestCombined.url) {
          formats.push({
            quality: bestCombined.qualityLabel || `${bestCombined.height}p` || "Best Quality",
            url: `/api/stream?url=${encodeURIComponent(bestCombined.url)}&title=${encodeURIComponent(info.videoDetails.title)}`,
            format: bestCombined.container || "mp4",
          });
        }
      } catch (e) {
        console.log("No combined format found, trying video-only");
      }
    }

    // Get all high quality video formats (including video-only, we'll combine with audio if needed)
    const videoFormats = info.formats
      .filter((f: any) => f.hasVideo && f.url && !f.isLive) // Must have video and URL, exclude live streams
      .map((f: any) => ({
        height: f.height || 0,
        qualityLabel: f.qualityLabel || `${f.height}p`,
        url: f.url,
        container: f.container || "mp4",
        hasAudio: f.hasAudio,
        format: f,
      }))
      .sort((a: any, b: any) => b.height - a.height); // Sort by height descending

    // Add high quality formats (1080p, 720p, 480p, 360p) - prioritize those with audio
    const qualityLevels = [2160, 1440, 1080, 720, 480, 360, 240, 144];
    
    for (const quality of qualityLevels) {
      // First try to find format with audio at this quality
      let formatAtQuality = videoFormats.find(
        (f: any) => f.height === quality && f.hasAudio && !formats.find((existing: any) => existing.quality === f.qualityLabel)
      );
      
      // If not found with audio, get video-only at this quality
      if (!formatAtQuality) {
        formatAtQuality = videoFormats.find(
          (f: any) => f.height === quality && !formats.find((existing: any) => existing.quality === f.qualityLabel)
        );
      }

      if (formatAtQuality) {
        formats.push({
          quality: formatAtQuality.qualityLabel,
          url: `/api/stream?url=${encodeURIComponent(formatAtQuality.url)}&title=${encodeURIComponent(info.videoDetails.title)}`,
          format: formatAtQuality.container,
        });
      }
    }

    // If we still don't have formats, try the chooseFormat method
    if (formats.length === 0 && chooseFormatFn) {
      try {
        // Try video-only highest quality
        const videoFormat = chooseFormatFn(info.formats, {
          quality: "highest",
          filter: "videoonly",
        });
        if (videoFormat && videoFormat.url) {
          formats.push({
            quality: videoFormat.qualityLabel || `${videoFormat.height}p` || "High Quality",
            url: `/api/stream?url=${encodeURIComponent(videoFormat.url)}&title=${encodeURIComponent(info.videoDetails.title)}`,
            format: videoFormat.container || "mp4",
          });
        }
      } catch (e) {
        console.error("Error getting video format:", e);
      }
    }

    // Fallback: get any available format
    if (formats.length === 0 && info.formats && info.formats.length > 0) {
      const availableFormat = videoFormats[0]; // Highest quality from sorted list
      if (availableFormat) {
        formats.push({
          quality: availableFormat.qualityLabel,
          url: `/api/stream?url=${encodeURIComponent(availableFormat.url)}&title=${encodeURIComponent(info.videoDetails.title)}`,
          format: availableFormat.container,
        });
      }
    }

    if (formats.length === 0) {
      throw new Error("No downloadable formats available for this video");
    }

    return {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]?.url || "",
      duration: formatDuration(parseInt(info.videoDetails.lengthSeconds)),
      formats,
    };
  } catch (error) {
    console.error("YouTube download error:", error);
    throw new Error("Failed to fetch YouTube video. Please check the URL and try again.");
  }
}

async function downloadInstagram(url: string): Promise<VideoInfo> {
  // Instagram requires a different approach
  // This is a placeholder implementation
  // In production, you'd need to use Instagram's API or a scraping service
  throw new Error(
    "Instagram download is currently being updated. Please try again later."
  );
}

async function downloadTikTok(url: string): Promise<VideoInfo> {
  // TikTok requires a different approach
  // This is a placeholder implementation
  // In production, you'd need to use TikTok's API or a scraping service
  throw new Error(
    "TikTok download is currently being updated. Please try again later."
  );
}

async function downloadTwitter(url: string): Promise<VideoInfo> {
  // Twitter/X requires a different approach
  // This is a placeholder implementation
  // In production, you'd need to use Twitter's API or a scraping service
  throw new Error(
    "Twitter/X download is currently being updated. Please try again later."
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}


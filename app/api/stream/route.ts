import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get("url");
    const title = searchParams.get("title") || "video";

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Fetch the video stream
    const response = await fetch(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: "https://www.youtube.com/",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    // Get content type from response or default to video/mp4
    const contentType = response.headers.get("content-type") || "video/mp4";

    // Stream the video to the client
    const stream = response.body;
    
    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title)}.mp4"`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Stream error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to stream video. Please try again.",
      },
      { status: 500 }
    );
  }
}


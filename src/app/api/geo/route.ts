import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get("ip");

    // Fetch directly from ipwho.is
    const targetUrl = ip ? `https://ipwho.is/${ip}` : "https://ipwho.is/";
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 ChronoPulse/1.0",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`ipwho.is returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Geo API route error:", errorMsg);

    // Dynamic fallback with default country India
    return NextResponse.json({
      ip: "127.0.0.1",
      success: true,
      city: "Current Location",
      region: "",
      country: "India",
      country_code: "IN",
      latitude: 20.5937,
      longitude: 78.9629,
      postal: "",
      timezone: {
        id: "Asia/Kolkata",
        abbr: "IST",
        offset: 19800,
        utc: "+05:30",
      },
      flag: {
        img: "https://cdn.ipwhois.io/flags/in.svg",
        emoji: "🇮🇳",
      },
    });
  }
}

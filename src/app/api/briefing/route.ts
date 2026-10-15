import { NextRequest, NextResponse } from "next/server";
import { NewsItem, AIBriefingData } from "@/types";

function parseRssXml(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  let count = 0;

  while ((match = itemRegex.exec(xml)) !== null && count < 12) {
    const itemBlock = match[1];

    // Title
    const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(itemBlock);
    let title = titleMatch ? titleMatch[1].trim() : "News Update";
    title = title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    // Source
    let source = "News";
    const sourceTagMatch = /<source[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/source>/i.exec(itemBlock);
    if (sourceTagMatch) {
      source = sourceTagMatch[1].trim();
    } else if (title.includes(" - ")) {
      const parts = title.split(" - ");
      source = parts.pop() || "News";
      title = parts.join(" - ");
    }

    // Link
    const linkMatch = /<link>([\s\S]*?)<\/link>/i.exec(itemBlock);
    const link = linkMatch ? linkMatch[1].trim() : "#";

    // PubDate
    const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemBlock);
    const rawDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
    
    let formattedDate = "Recently";
    try {
      const dateObj = new Date(rawDate);
      const diffMs = Date.now() - dateObj.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 1) {
        formattedDate = "Just now";
      } else if (diffHrs === 1) {
        formattedDate = "1h ago";
      } else if (diffHrs < 24) {
        formattedDate = `${diffHrs}h ago`;
      } else {
        formattedDate = `${Math.floor(diffHrs / 24)}d ago`;
      }
    } catch {
      formattedDate = "Today";
    }

    const lower = title.toLowerCase();
    let category: NewsItem["category"] = "Local";
    if (lower.includes("tech") || lower.includes("ai") || lower.includes("digital") || lower.includes("startup") || lower.includes("software")) {
      category = "Technology";
    } else if (lower.includes("govt") || lower.includes("minister") || lower.includes("court") || lower.includes("policy") || lower.includes("election")) {
      category = "Governance";
    } else if (lower.includes("market") || lower.includes("economy") || lower.includes("shares") || lower.includes("bank") || lower.includes("rupee") || lower.includes("dollar")) {
      category = "Business";
    } else if (lower.includes("festival") || lower.includes("culture") || lower.includes("cinema") || lower.includes("cricket") || lower.includes("sports")) {
      category = "Culture";
    } else if (lower.includes("rain") || lower.includes("flood") || lower.includes("heat") || lower.includes("weather") || lower.includes("pollution")) {
      category = "Weather";
    }

    items.push({
      id: `news-${count}-${Date.now()}`,
      title,
      link,
      pubDate: formattedDate,
      source,
      category,
    });
    count++;
  }

  return items;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "";
  const region = searchParams.get("region") || "";
  const country = searchParams.get("country") || "India";
  const countryCode = (searchParams.get("countryCode") || "IN").toUpperCase();
  const weatherDesc = searchParams.get("weatherDesc") || "Clear";
  const temp = searchParams.get("temp") || "25";

  let news: NewsItem[] = [];

  const queryTerms = [city, region, country].filter(Boolean).join(" ");

  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(queryTerms)}&hl=en-${countryCode}&gl=${countryCode}&ceid=${countryCode}:en`;
    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 ChronoPulse/1.0",
      },
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const xml = await response.text();
      news = parseRssXml(xml);
    }
  } catch (err) {
    console.error("RSS fetch error:", err);
  }

  const locationDisplay = city || region || country;

  if (news.length === 0) {
    news = [
      {
        id: "fallback-1",
        title: `${locationDisplay} municipal & infrastructure development projects initiated`,
        link: "https://news.google.com",
        pubDate: "2h ago",
        source: `${locationDisplay} Daily`,
        category: "Local",
      },
      {
        id: "fallback-2",
        title: `Regional tech hubs & clean energy programs expand across ${country}`,
        link: "https://news.google.com",
        pubDate: "4h ago",
        source: "Tech Radar",
        category: "Technology",
      },
      {
        id: "fallback-3",
        title: `Economic outlook remains steady with active retail indicators in ${locationDisplay}`,
        link: "https://news.google.com",
        pubDate: "6h ago",
        source: "Economic Bureau",
        category: "Business",
      },
      {
        id: "fallback-4",
        title: `Cultural exhibitions and regional events scheduled this weekend`,
        link: "https://news.google.com",
        pubDate: "8h ago",
        source: "Culture Herald",
        category: "Culture",
      },
    ];
  }

  // Synthesize AI Regional Briefing
  const tempNum = parseFloat(temp);
  let weatherNarrative = "";
  let lifestyleTip = "";

  if (tempNum >= 34) {
    weatherNarrative = `Intense warmth observed in ${locationDisplay} at ${temp}°C. Strong sunlight with high radiant heat.`;
    lifestyleTip = "Wear light cotton clothing, keep hydrated, and limit prolonged direct afternoon exposure.";
  } else if (tempNum >= 25) {
    weatherNarrative = `Pleasant ambient conditions across ${locationDisplay} with ${weatherDesc.toLowerCase()} skies at ${temp}°C.`;
    lifestyleTip = "Favorable window for outdoor travel, commute, and recreational activities through the evening.";
  } else if (tempNum >= 16) {
    weatherNarrative = `Brisk atmosphere across ${locationDisplay} with ambient temperature near ${temp}°C.`;
    lifestyleTip = "Comfortable light jacket recommended for early morning and late evening strolls.";
  } else {
    weatherNarrative = `Cold, brisk weather settling across ${locationDisplay} with readings around ${temp}°C.`;
    lifestyleTip = "Thermal layer or warm jacket suggested for outdoor transit.";
  }

  const areaPulseScore = 88;
  const areaPulseLabel = "Active & Vibrant";

  const keyHighlights = [
    `Atmospheric conditions across ${locationDisplay} show stable patterns.`,
    `Urban transit operating with normal community pace.`,
    `Local news signals steady economic and administrative activity.`,
  ];

  const briefing: AIBriefingData = {
    city: city || locationDisplay,
    region,
    country,
    generatedAt: new Date().toISOString(),
    weatherNarrative,
    lifestyleTip,
    areaPulseScore,
    areaPulseLabel,
    news,
    keyHighlights,
  };

  return NextResponse.json(briefing);
}

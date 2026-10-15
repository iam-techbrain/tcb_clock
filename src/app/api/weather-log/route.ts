import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, temperature, conditionText, shortDescription, weather } = body;

    if (!city || temperature === undefined) {
      return NextResponse.json(
        { error: "City and temperature are required" },
        { status: 400 }
      );
    }

    // 1-line weather description
    const weatherSummary = String(weather || conditionText || shortDescription || "Clear");

    // Save into Supabase table daily_weather_records
    const log = await prisma.daily_weather_records.create({
      data: {
        city: String(city),
        temperature: Number(temperature),
        weather: weatherSummary,
      },
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    console.error("Prisma Supabase sync error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to log weather data",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    const logs = await prisma.daily_weather_records.findMany({
      where: city ? { city: { equals: city, mode: "insensitive" } } : undefined,
      orderBy: { date_time: "desc" },
      take: 10,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

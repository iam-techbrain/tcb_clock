import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      city,
      region,
      country,
      countryCode,
      timezone,
      temperature,
      apparentTemperature,
      conditionText,
      weatherCode,
      humidity,
      windSpeed,
      uvIndex,
      surfacePressure,
      sunrise,
      sunset,
      shortDescription,
    } = body;

    if (!city || temperature === undefined) {
      return NextResponse.json(
        { error: "City and temperature are required" },
        { status: 400 }
      );
    }

    // Save daily date, time and weather record in Supabase
    const log = await prisma.dailyWeatherLog.create({
      data: {
        city: String(city),
        region: region ? String(region) : null,
        country: country ? String(country) : "India",
        countryCode: countryCode ? String(countryCode) : "IN",
        timezone: timezone ? String(timezone) : "Asia/Kolkata",
        temperature: Number(temperature),
        apparentTemperature: apparentTemperature !== undefined ? Number(apparentTemperature) : null,
        conditionText: String(conditionText || "Clear"),
        weatherCode: Number(weatherCode || 0),
        humidity: Number(humidity || 0),
        windSpeed: Number(windSpeed || 0),
        uvIndex: uvIndex !== undefined && uvIndex !== null ? Number(uvIndex) : null,
        surfacePressure: surfacePressure !== undefined && surfacePressure !== null ? Number(surfacePressure) : null,
        sunrise: sunrise ? String(sunrise) : null,
        sunset: sunset ? String(sunset) : null,
        shortDescription: shortDescription ? String(shortDescription) : null,
      },
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    console.error("Prisma Supabase sync error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to log weather data",
        hint:
          error?.message?.includes("password authentication failed") ||
          error?.message?.includes("[YOUR-PASSWORD]")
            ? "Please replace [YOUR-PASSWORD] in .env with your actual Supabase database password."
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    const logs = await prisma.dailyWeatherLog.findMany({
      where: city ? { city: { equals: city, mode: "insensitive" } } : undefined,
      orderBy: { loggedAt: "desc" },
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

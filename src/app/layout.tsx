import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retro Flip Clock • AI Weather & Regional Radar",
  description: "Aesthetic retro mechanical flip clock with dynamic IP geolocation, live weather telemetry, and AI regional news briefing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Arial, sans-serif, "Noto Color Emoji"' }}>
        {children}
      </body>
    </html>
  );
}

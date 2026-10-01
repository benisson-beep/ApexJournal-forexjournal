import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ApexJournal — Institutional Forex Trading Journal",
  description: "Performance analytics terminal and trading journal with real-time MT4/MT5 auto-sync, R-multiple tracking, and behavioral risk analysis.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "ApexJournal — Institutional Forex Trading Journal",
    description: "Performance analytics terminal and trading journal with real-time MT4/MT5 auto-sync, R-multiple tracking, and behavioral risk analysis.",
    type: "website",
    siteName: "ApexJournal",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApexJournal — Institutional Forex Trading Journal",
    description: "Performance analytics terminal and trading journal with real-time MT4/MT5 auto-sync, R-multiple tracking, and behavioral risk analysis.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

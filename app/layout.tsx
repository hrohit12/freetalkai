import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://everydayai.in.net"),
  title: "EverydayAI - Free AI Chat Assistant (No Login)",
  description: "Access powerful AI models for free. EverydayAI is a fast, intelligent, and friction-less chat assistant with no signup required.",
  keywords: ["free ai chat", "no login ai", "openrouter chat", "everyday ai", "ai assistant", "everydayai.in.net"],
  openGraph: {
    title: "EverydayAI - Free AI Chat Assistant",
    description: "Fast, intelligent chat with no login required. Powered by EverydayAI.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EverydayAI Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EverydayAI - Free AI Chat Assistant",
    description: "No login, no cost, just pure intelligence.",
    images: ["/og-image.png"],
  },
  other: {
    monetag: "814302b668f949d3dcae34dd5f9ffe3d",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://5gvci.com/act/files/tag.min.js?z=10967483" data-cfasync="false" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

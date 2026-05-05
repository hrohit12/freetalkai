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
  title: "FreetalkAI - Free AI Chat Assistant (No Login)",
  description: "Access powerful AI models for free. FreetalkAI is a fast, intelligent, and friction-less chat assistant with no signup required.",
  keywords: ["free ai chat", "no login ai", "openrouter chat", "freetalk ai", "ai assistant"],
  openGraph: {
    title: "FreetalkAI - Free AI Chat Assistant",
    description: "Fast, intelligent chat with no login required. Powered by FreetalkAI.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FreetalkAI Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreetalkAI - Free AI Chat Assistant",
    description: "No login, no cost, just pure intelligence.",
    images: ["/og-image.png"],
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
        <Script 
          src="https://pl29340285.profitablecpmratenetwork.com/3d/d1/6d/3dd16d87dff21a5df0fa48bd6200a645.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

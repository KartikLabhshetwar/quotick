import type { Metadata } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Quotick",
  description: "Instantly converts quotes to backticks as you type. No more retyping template literals.",
  openGraph: {
    title: "Quotick",
    description: "Instantly converts quotes to backticks as you type. No more retyping template literals.",
    url: "https://quotick.vercel.app/", // Replace with your actual domain
    siteName: "Quotick",
    images: [
      {
        url: "/og-image.png", // Relative path to your og-image.png
        width: 1200,
        height: 630,
        alt: "Quotick - VS Code Extension for converting quotes to backticks",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quotick",
    description: "Instantly converts quotes to backticks as you type. No more retyping template literals.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

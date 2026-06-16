import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/context/language";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mess Manager - Bangladesh Edition",
  description: "Mess Management System for Bangladeshi bachelor accommodations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        <Providers>
          <LanguageProvider>
            <Sidebar />
            <main className="flex-1 lg:ml-0 p-6 lg:p-8 bg-slate-50 min-h-screen">
              {children}
            </main>
            <Toaster />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as Sonner } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Powered Project Management — Online Course",
  description:
    "A comprehensive, hands-on course that teaches project managers to use AI for planning, documentation, communication, and reporting.",
  keywords: ["AI", "Project Management", "Course", "PMP", "ChatGPT", "Claude", "Gemini"],
  authors: [{ name: "Course Instructor" }],
  openGraph: {
    title: "AI-Powered Project Management",
    description: "From planning to reporting — learn to use AI in your PM workflows.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Sonner position="top-center" />
      </body>
    </html>
  );
}
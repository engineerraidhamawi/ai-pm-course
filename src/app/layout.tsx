import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as Sonner } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { BackToTop } from "@/components/ui/back-to-top";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-pm-course-liart.vercel.app"),
  title: "AI-Powered Project Management — Online Course",
  description:
    "A comprehensive, hands-on course that teaches project managers to use AI for planning, documentation, communication, and reporting.",
  keywords: ["AI", "Project Management", "Course", "PMP", "ChatGPT", "Claude", "Gemini"],
  authors: [{ name: "Dr. Raid Hamawi" }],
  icons: {
    icon: "/course-logo.png",
    apple: "/course-logo.png",
  },
  openGraph: {
    title: "AI-Powered Project Management",
    description: "From planning to reporting — learn to use AI in your PM workflows. 18 modules, quizzes, certificate.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI-Powered Project Management Course",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered Project Management",
    description: "From planning to reporting — learn to use AI in your PM workflows.",
    images: ["/og-image.png"],
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <BackToTop />
          <Sonner position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
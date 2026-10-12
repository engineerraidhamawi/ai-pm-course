import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as Sonner } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
  icons: {
    icon: "/course-logo.png",
    apple: "/course-logo.png",
  },
  openGraph: {
    title: "AI-Powered Project Management",
    description: "From planning to reporting — learn to use AI in your PM workflows.",
    type: "website",
    images: ["/course-logo.png"],
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
          <Sonner position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
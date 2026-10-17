import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-8">
        <img
          src="/course-logo.png"
          alt="AI-Powered Project Management logo"
          className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-lg"
        />
      </div>
      
      <h1 className="text-6xl font-extrabold text-indigo-600 sm:text-8xl">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">Page Not Found</h2>
      <p className="mt-3 max-w-md text-slate-500">
        Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Home className="mr-1.5 h-4 w-4" />
            Back to Course
          </Button>
        </Link>
        <Link href="/#modules">
          <Button variant="outline">
            View Curriculum
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <p className="mt-12 text-xs text-slate-400">
        AI-Powered Project Management — Online Course
      </p>
    </div>
  );
}
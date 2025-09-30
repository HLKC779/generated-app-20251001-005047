import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-slate-50 dark:bg-slate-950">
      <div className="relative mb-8">
        <Bot className="h-32 w-32 text-indigo-500" />
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-slate-700 dark:text-slate-300">?</span>
        </div>
      </div>
      <h1 className="text-6xl font-bold text-slate-800 dark:text-slate-200">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-slate-700 dark:text-slate-300">Page Not Found</h2>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/dashboard" className="mt-8">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}
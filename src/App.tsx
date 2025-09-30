import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
function App() {
  const [showNotice, setShowNotice] = useState(false);
  useEffect(() => {
    const noticeShown = sessionStorage.getItem('ai-notice-shown');
    if (!noticeShown) {
      setShowNotice(true);
    }
  }, []);
  const handleCloseNotice = () => {
    sessionStorage.setItem('ai-notice-shown', 'true');
    setShowNotice(false);
  };
  return (
    <div className="relative flex min-h-screen w-full bg-white dark:bg-slate-950">
      <Sidebar />
      <ThemeToggle className="fixed top-4 right-4" />
      <main className="flex-1 pl-20">
        <Outlet />
      </main>
      <Toaster richColors />
      <Dialog open={showNotice} onOpenChange={setShowNotice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Important Notice for Self-Deployment
            </DialogTitle>
            <DialogDescription className="pt-4 text-base text-slate-600 dark:text-slate-400 space-y-3">
              <p>
                Welcome to VibeCode! Please be aware that some features in this live demo require configuration to work in your own deployment.
              </p>
              <p>
                <strong>AI Assistant:</strong> For security reasons, we cannot use live API keys in this public environment. To enable full AI capabilities, you must deploy this project yourself and add your own API keys for the Cloudflare AI Gateway.
              </p>
              <p>
                <strong>Template Marketplace:</strong> This feature requires you to configure and bind a D1 Database and an R2 Bucket in your Cloudflare account to store and serve project templates.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseNotice}>I Understand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default App;
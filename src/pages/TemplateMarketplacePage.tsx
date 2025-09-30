import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Template } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/stores/useProjectStore';
import { toast } from 'sonner';
const frameworkColors: { [key: string]: string } = {
  React: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
  Vue: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  Svelte: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  Node: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};
export function TemplateMarketplacePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const createProject = useProjectStore((state) => state.createProject);
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/templates');
        if (!response.ok) {
          if (response.status === 503) {
            throw new Error('Backend service unavailable. Please ensure D1 database and R2 storage are configured for this project.');
          }
          throw new Error(`Failed to fetch templates. Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          const parsedTemplates = result.data.map((t: any) => ({
            ...t,
            tags: typeof t.tags === 'string' ? JSON.parse(t.tags) : t.tags,
          }));
          setTemplates(parsedTemplates);
        } else {
          throw new Error(result.error || 'An unknown error occurred');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        toast.error("Failed to load templates.", { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);
  const handleCreateProject = async (template: Template) => {
    const toastId = toast.loading(`Creating project from "${template.name}"...`);
    const newProject = await createProject(template);
    if (newProject) {
      toast.success(`Project "${newProject.name}" created!`, { id: toastId });
      navigate(`/project/${newProject.id}`);
    } else {
      toast.error(`Failed to create project from "${template.name}".`, { id: toastId });
    }
  };
  return (
    <div className="flex flex-col h-screen">
      <header className="flex flex-col gap-4 p-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Template Marketplace
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Start your next project with a powerful, pre-built template.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-center text-red-500 dark:text-red-400 p-4">
            <div className="max-w-md">
              <h3 className="text-xl font-semibold mb-2">Could not load templates</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                onClick={() => handleCreateProject(template)}
              >
                <CardHeader className="flex-row items-start gap-4 p-4">
                  <Avatar>
                    <AvatarImage src={template.avatarUrl} alt={template.author} />
                    <AvatarFallback>{template.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{template.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">by {template.author}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 pt-0">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant={tag === 'Official' ? 'default' : 'secondary'}>{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{(template.installs / 1000).toFixed(1)}k</span>
                  </div>
                  <Badge className={cn('text-xs font-medium', frameworkColors[template.framework])}>
                    {template.framework}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <footer className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Built with ❤️ at Cloudflare
      </footer>
    </div>
  );
}
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/stores/useProjectStore';
import { formatDistanceToNow } from 'date-fns';
import { ProjectDeleteDialog } from '@/components/ProjectDeleteDialog';
const frameworkColors: { [key: string]: string } = {
  React: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
  Vue: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  Svelte:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  Node: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};
export function HomePage() {
  const projects = useProjectStore((state) => state.projects);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
    }
    setProjectToDelete(null);
    setIsDeleteDialogOpen(false);
  };
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Welcome back, let's create something amazing.
          </p>
        </div>
        <Link to="/templates">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </header>
      <div className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search projects..."
            className="pl-10 max-w-sm"
          />
        </div>
      </div>
      <main className="flex-1 overflow-y-auto p-6 pt-0">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
            <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
            <p className="mb-4">Get started by creating your first project.</p>
            <Link to="/templates">
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4" />
                Create New Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader className="flex-row items-start justify-between p-4">
                  <div className="flex flex-col">
                    <Link
                      to={`/project/${project.id}`}
                      className="font-semibold text-slate-800 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                    >
                      {project.name}
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Updated {formatDistanceToNow(new Date(project.lastUpdated), { addSuffix: true })}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:bg-red-50 focus:text-red-600"
                        onClick={() => handleDeleteClick(project)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="p-0">
                  <Link to={`/project/${project.id}`} className="block">
                    <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <p className="text-slate-400 text-sm">
                        Project Preview
                      </p>
                    </div>
                  </Link>
                </CardContent>
                <CardFooter className="p-4">
                  <Badge
                    className={cn(
                      'text-xs font-medium',
                      frameworkColors[project.framework]
                    )}
                  >
                    {project.framework}
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
      <ProjectDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        project={projectToDelete}
      />
    </div>
  );
}
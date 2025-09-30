import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Project, Template } from '@/lib/types';
import { toast } from 'sonner';
interface ProjectStore {
  projects: Project[];
  createProject: (template: Template) => Promise<Project | null>;
  deleteProject: (projectId: string) => void;
}
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      createProject: async (template) => {
        try {
          const response = await fetch(`/api/templates/${template.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch template content.');
          }
          // For now, we assume it's just a single file content.
          // A real implementation would handle a file tree.
          const templateContent = await response.text();
          const newProject: Project = {
            id: crypto.randomUUID(),
            name: `${template.name}`, // No "Copy" suffix for a cleaner name
            framework: template.framework,
            lastUpdated: new Date().toISOString(),
            thumbnailUrl: '/placeholder.svg',
            templateContent: templateContent,
          };
          set((state) => ({ projects: [...state.projects, newProject] }));
          return newProject;
        } catch (error) {
          console.error('Error creating project:', error);
          toast.error('Could not create project. Failed to load template.');
          return null;
        }
      },
      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        }));
        toast.success('Project deleted.');
      },
    }),
    {
      name: 'vibecode-projects-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
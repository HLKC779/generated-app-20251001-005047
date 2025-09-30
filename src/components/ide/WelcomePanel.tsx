import { FileCode, Bot, Rocket, FolderPlus, FilePlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const features = [
  {
    icon: FilePlus,
    title: 'Create a new file',
    description: 'Right-click in the explorer to add a new file to your project.',
  },
  {
    icon: FolderPlus,
    title: 'Create a new folder',
    description: 'Organize your code by creating new folders.',
  },
  {
    icon: Bot,
    title: 'Use the AI Assistant',
    description: 'Ask for code, get explanations, or let it refactor your work.',
  },
  {
    icon: Rocket,
    title: 'Deploy your project',
    description: 'When you\'re ready, deploy your project to the edge with one click.',
  },
];
export function WelcomePanel() {
  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <FileCode className="mx-auto h-16 w-16 text-indigo-400 mb-6" />
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
          Welcome to VibeCode
        </h2>
        <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
          Your collaborative coding environment is ready. Here are a few things you can do to get started:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 text-left">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
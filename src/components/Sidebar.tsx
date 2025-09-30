import {
  LayoutDashboard,
  Code,
  Rocket,
  Settings,
  LifeBuoy,
  Github,
  Bot,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/templates', icon: Code, label: 'Templates' },
  { to: '/deployments', icon: Rocket, label: 'Deployments' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];
const helpItems = [
  { to: '/help', icon: LifeBuoy, label: 'Help & Support' },
  {
    href: 'https://github.com/cloudflare/vibecode',
    icon: Github,
    label: 'GitHub',
  },
];
const NavItem = ({
  item,
}: {
  item: { to?: string; href?: string; icon: React.ElementType; label: string };
}) => {
  const commonClasses =
    'flex items-center justify-center h-12 w-12 rounded-lg transition-colors duration-200 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-50';
  const activeClasses =
    'bg-indigo-50 text-indigo-600 dark:bg-slate-700 dark:text-slate-50';
  const content = (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {item.to ? (
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(commonClasses, isActive && activeClasses)
              }
            >
              <item.icon className="h-6 w-6" />
            </NavLink>
          ) : (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={commonClasses}
            >
              <item.icon className="h-6 w-6" />
            </a>
          )}
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  return content;
};
export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex h-full w-20 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-20 items-center justify-center border-b border-slate-200 dark:border-slate-800">
        <NavLink to="/dashboard" className="group">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow">
            <Bot className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-12" />
          </div>
        </NavLink>
      </div>
      <nav className="flex flex-1 flex-col items-center gap-y-4 p-2">
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-y-4 p-2 pb-4">
        {helpItems.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </div>
    </aside>
  );
}
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDeploymentStore } from '@/stores/useDeploymentStore';
import { Button } from '@/components/ui/button';
import { Rocket, Cloud, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { DeploymentDialog } from '@/components/deployment/DeploymentDialog';
import { Deployment } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
const statusInfo = {
  Success: { icon: CheckCircle2, color: 'text-green-500' },
  Building: { icon: Loader2, color: 'text-blue-500 animate-spin' },
  Failed: { icon: XCircle, color: 'text-red-500' },
};
export function DeploymentPanel() {
  const { projectId } = useParams<{ projectId: string }>();
  const allDeployments = useDeploymentStore((state) => state.deployments);
  const addDeployment = useDeploymentStore((state) => state.addDeployment);
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const projectDeployments = allDeployments.filter(d => d.projectId === projectId);
  const handleDeploymentComplete = (deployment: Deployment) => {
    addDeployment(deployment);
  };
  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950">
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold">Deployments</h3>
        </div>
        <Button
          size="sm"
          className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500"
          onClick={() => setIsDeployDialogOpen(true)}
        >
          <Cloud className="h-4 w-4" />
          New Deployment
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {projectDeployments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
            <Rocket className="h-12 w-12 mb-4 opacity-50" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">No deployments yet</h4>
            <p className="text-sm">Click "New Deployment" to get started.</p>
          </div>
        ) : (
          <ul className="p-2 space-y-2">
            {projectDeployments.map((deployment) => {
              const StatusIcon = statusInfo[deployment.status].icon;
              return (
                <li key={deployment.id} className="p-3 rounded-md border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn('h-5 w-5', statusInfo[deployment.status].color)} />
                      <span className="font-medium text-sm">{deployment.version}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(deployment.deployedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 pl-7 truncate">
                    {deployment.commit}
                  </p>
                  {deployment.status === 'Success' && (
                     <a href={`https://${deployment.url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400 mt-1 pl-7 block">
                       {deployment.url}
                     </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
      {projectId && (
        <DeploymentDialog
          isOpen={isDeployDialogOpen}
          onOpenChange={setIsDeployDialogOpen}
          onDeploymentComplete={handleDeploymentComplete}
          projectId={projectId}
        />
      )}
    </div>
  );
}
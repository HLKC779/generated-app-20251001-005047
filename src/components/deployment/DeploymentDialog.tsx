import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2, Rocket } from 'lucide-react';
import { Deployment } from '@/lib/types';
type DeploymentStatus = 'idle' | 'configuring' | 'deploying' | 'success' | 'failed';
const deploymentSteps = [
  { name: 'Initializing', duration: 500 },
  { name: 'Building project', duration: 1000 },
  { name: 'Deploying to edge', duration: 1500 },
  { name: 'Finalizing', duration: 500 },
];
interface DeploymentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDeploymentComplete: (deployment: Deployment) => void;
  projectId: string;
}
export function DeploymentDialog({ isOpen, onOpenChange, onDeploymentComplete, projectId }: DeploymentDialogProps) {
  const [status, setStatus] = useState<DeploymentStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [deploymentResult, setDeploymentResult] = useState<Deployment | null>(null);
  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setStatus('configuring');
      setProgress(0);
      setCurrentStep('');
      setDeploymentResult(null);
    }
  }, [isOpen]);
  const handleDeploy = async () => {
    setStatus('deploying');
    let cumulativeProgress = 0;
    const totalDuration = deploymentSteps.reduce((sum, step) => sum + step.duration, 0);
    for (const step of deploymentSteps) {
      setCurrentStep(step.name);
      await new Promise(resolve => setTimeout(resolve, step.duration));
      cumulativeProgress += (step.duration / totalDuration) * 100;
      setProgress(cumulativeProgress);
    }
    try {
      const response = await fetch(`/api/projects/${projectId}/deploy`, { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        setDeploymentResult(result.data);
        setStatus(result.data.status === 'Success' ? 'success' : 'failed');
        onDeploymentComplete(result.data);
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      console.error('Deployment failed:', error);
      setStatus('failed');
    }
  };
  const renderContent = () => {
    switch (status) {
      case 'configuring':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Deploy Project</DialogTitle>
              <DialogDescription>
                Configure your deployment settings and start the process.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-slate-500">Deployment target: Cloudflare Workers</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleDeploy} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Rocket className="mr-2 h-4 w-4" /> Deploy Now
              </Button>
            </DialogFooter>
          </>
        );
      case 'deploying':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Deploying...
              </DialogTitle>
              <DialogDescription>
                Your project is being built and deployed to the Cloudflare network.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <Progress value={progress} />
              <p className="text-center text-sm text-slate-500">{currentStep}</p>
            </div>
          </>
        );
      case 'success':
        return (
          <>
            <DialogHeader className="items-center text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <DialogTitle>Deployment Successful!</DialogTitle>
              <DialogDescription>
                Your project is now live.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center">
              <a href={`https://${deploymentResult?.url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:underline">
                {deploymentResult?.url}
              </a>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)} className="w-full">Close</Button>
            </DialogFooter>
          </>
        );
      case 'failed':
        return (
          <>
            <DialogHeader className="items-center text-center">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <DialogTitle>Deployment Failed</DialogTitle>
              <DialogDescription>
                Something went wrong during the deployment process.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleDeploy}>Try Again</Button>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Deployment } from '@/lib/types';
import { toast } from 'sonner';
interface DeploymentStore {
  deployments: Deployment[];
  addDeployment: (deployment: Deployment) => void;
  getDeploymentsByProject: (projectId: string) => Deployment[];
}
export const useDeploymentStore = create<DeploymentStore>()(
  persist(
    (set, get) => ({
      deployments: [],
      addDeployment: (deployment) => {
        set((state) => ({
          deployments: [deployment, ...state.deployments],
        }));
        toast.success(`Deployment ${deployment.version} finished with status: ${deployment.status}`);
      },
      getDeploymentsByProject: (projectId) => {
        return get().deployments.filter(d => d.projectId === projectId);
      },
    }),
    {
      name: 'vibecode-deployments-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Deployment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Globe, Plus, Trash2, Rocket } from 'lucide-react';
import { useDeploymentStore } from '@/stores/useDeploymentStore';
import { formatDistanceToNow } from 'date-fns';
const statusColors = {
  Success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Building: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};
const mockRequestsData = [
  { name: 'Mon', requests: 4000 },
  { name: 'Tue', requests: 3000 },
  { name: 'Wed', requests: 2000 },
  { name: 'Thu', requests: 2780 },
  { name: 'Fri', requests: 1890 },
  { name: 'Sat', requests: 2390 },
  { name: 'Sun', requests: 3490 },
];
const mockLatencyData = [
  { name: 'Mon', p95: 120 },
  { name: 'Tue', p95: 110 },
  { name: 'Wed', p95: 150 },
  { name: 'Thu', p95: 130 },
  { name: 'Fri', p95: 140 },
  { name: 'Sat', p95: 100 },
  { name: 'Sun', p95: 90 },
];
export function DeploymentDashboardPage() {
  const deployments = useDeploymentStore((state) => state.deployments);
  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      <header className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Deployments
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Monitor and manage all your project deployments.
        </p>
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Requests (Last 7 Days)</CardTitle>
              <CardDescription>2.1M requests</CardDescription>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRequestsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests" fill="rgb(99 102 241)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>P95 Latency (Last 7 Days)</CardTitle>
              <CardDescription>115ms average</CardDescription>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockLatencyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="p95" stroke="rgb(99 102 241)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
        <Card>
          <CardHeader>
            <CardTitle>Deployment History</CardTitle>
            <CardDescription>
              A log of all your recent deployments across all projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deployments.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Rocket className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold">No Deployments Yet</h3>
                <p>Deploy a project from the IDE to see its history here.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deployed At</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Commit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deployments.map((deployment) => (
                    <TableRow key={deployment.id}>
                      <TableCell className="font-medium">
                        {deployment.version}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(statusColors[deployment.status])}>
                          {deployment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDistanceToNow(new Date(deployment.deployedAt), { addSuffix: true })}</TableCell>
                      <TableCell>
                        {deployment.url !== '-' ? (
                          <a href={`https://${deployment.url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">
                            {deployment.url}
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{deployment.commit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Custom Domains</CardTitle>
            <CardDescription>
              Manage custom domains for your project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">my-cool-project.com</span>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Enter new domain..." />
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4" /> Add Domain
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
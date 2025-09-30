import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TeamMember, Plan } from '@/lib/types';
import { Check, Github, Plus } from 'lucide-react';
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'You',
    email: 'you@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704a',
    role: 'Owner',
  },
  {
    id: '2',
    name: 'Alice',
    email: 'alice@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    role: 'Admin',
  },
  {
    id: '3',
    name: 'Bob',
    email: 'bob@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
    role: 'Developer',
  },
];
const mockPlan: Plan = {
  name: 'Pro',
  price: '$20/month',
  features: [
    'Unlimited projects',
    'Team collaboration',
    'Custom domains',
    'Priority support',
  ],
};
export function SettingsPage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      <header className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Workspace Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your workspace, billing, and integrations.
        </p>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="members" className="w-full">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="project">Project</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Invite and manage your workspace members.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input placeholder="member@example.com" />
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="h-4 w-4" /> Invite
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTeamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback>
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-slate-500">
                              {member.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select defaultValue={member.role}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Developer">
                                Developer
                              </SelectItem>
                              <SelectItem value="Viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="project" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Manage your project's general settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input id="project-name" defaultValue="E-commerce Frontend" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-framework">Framework</Label>
                  <Input id="project-framework" defaultValue="React" disabled />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="billing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
                <CardDescription>
                  Manage your subscription and payment details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Card className="bg-slate-100 dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle>Current Plan: {mockPlan.name}</CardTitle>
                    <CardDescription>{mockPlan.price}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {mockPlan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Upgrade Plan
                    </Button>
                  </CardFooter>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect VibeCode with your favorite tools.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-4">
                    <Github className="h-8 w-8" />
                    <div>
                      <h4 className="font-semibold">GitHub</h4>
                      <p className="text-sm text-slate-500">
                        Sync your projects with GitHub repositories.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
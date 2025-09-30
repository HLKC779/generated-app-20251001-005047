import { enableMapSet } from 'immer';
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import App from '@/App';
import { HomePage } from '@/pages/HomePage';
import { IdePage } from '@/pages/IdePage';
import { TemplateMarketplacePage } from '@/pages/TemplateMarketplacePage';
import { DeploymentDashboardPage } from '@/pages/DeploymentDashboardPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <HomePage />,
      },
      {
        path: 'project/:projectId',
        element: <IdePage />,
      },
      {
        path: 'templates',
        element: <TemplateMarketplacePage />,
      },
      {
        path: 'deployments',
        element: <DeploymentDashboardPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'help',
        element: <PlaceholderPage title="Help & Support" />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>
);
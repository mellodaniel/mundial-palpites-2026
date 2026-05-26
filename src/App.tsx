import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Matches } from './pages/Matches';
import { Ranking } from './pages/Ranking';
import { Admin } from './pages/Admin';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'jogos',
            element: <Matches />,
          },
          {
            path: 'ranking',
            element: <Ranking />,
          },
          {
            element: <AdminRoute />,
            children: [
              {
                path: 'admin',
                element: <Admin />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
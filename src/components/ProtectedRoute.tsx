import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

export function ProtectedRoute() {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-lg font-bold">A carregar...</p>
          <p className="mt-2 text-sm text-slate-400">
            A validar a tua sessão.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
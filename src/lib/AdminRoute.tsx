import { Navigate, Outlet } from 'react-router-dom';
import { useProfile } from '../lib/useProfile';

export function AdminRoute() {
  const { profile, isLoadingProfile, profileError } = useProfile();

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-lg font-bold">A carregar...</p>
          <p className="mt-2 text-sm text-slate-400">
            A validar permissões de admin.
          </p>
        </div>
      </div>
    );
  }

  if (profileError || !profile?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
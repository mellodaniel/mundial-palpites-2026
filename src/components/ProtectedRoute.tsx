import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { useProfile } from '../lib/useProfile';

export function ProtectedRoute() {
  const { user, isLoadingAuth } = useAuth();
  const { profile, isLoadingProfile } = useProfile();

  if (isLoadingAuth || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        A carregar...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    profile?.accountStatus === 'disabled' ||
    profile?.accountStatus === 'blocked' ||
    profile?.accountStatus === 'deleted'
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-md rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-center">
          <h1 className="text-2xl font-black">Conta sem acesso</h1>
          <p className="mt-3 text-red-100">
            A tua conta está atualmente sem acesso à app. Contacta o
            administrador da liga.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
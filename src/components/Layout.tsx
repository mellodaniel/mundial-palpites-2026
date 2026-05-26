import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Trophy,
  CalendarDays,
  BarChart3,
  Shield,
  LogOut,
  User,
  Users,
} from 'lucide-react';
import { signOut } from '../lib/auth';
import { useProfile } from '../lib/useProfile';

export function Layout() {
  const navigate = useNavigate();
  const { profile } = useProfile();

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  const mobileColumns = profile?.isAdmin ? 'grid-cols-6' : 'grid-cols-5';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">Mundial Palpites 2026</h1>
            <p className="text-sm text-slate-400">
              Palpites, ranking e competição entre amigos
            </p>
          </div>

          <div className="flex items-center gap-3">
            {profile?.isAdmin && (
              <div className="hidden rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300 sm:block">
                Admin
              </div>
            )}

            <div className="hidden rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300 sm:block">
              MVP
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full bg-white/10 p-2 text-slate-300 hover:bg-white/15"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-slate-900/95 backdrop-blur md:hidden">
        <div className={`grid ${mobileColumns}`}>
          <MobileNavLink to="/" icon={<Trophy size={20} />} label="Início" />
          <MobileNavLink
            to="/jogos"
            icon={<CalendarDays size={20} />}
            label="Jogos"
          />
          <MobileNavLink
            to="/ranking"
            icon={<BarChart3 size={20} />}
            label="Ranking"
          />
          <MobileNavLink
            to="/ligas"
            icon={<Users size={20} />}
            label="Ligas"
          />
          <MobileNavLink
            to="/perfil"
            icon={<User size={20} />}
            label="Perfil"
          />
          {profile?.isAdmin && (
            <MobileNavLink
              to="/admin"
              icon={<Shield size={20} />}
              label="Admin"
            />
          )}
        </div>
      </nav>

      <nav className="hidden border-t border-white/10 bg-slate-900 md:block">
        <div className="mx-auto flex max-w-6xl gap-2 px-4 py-3">
          <DesktopNavLink to="/">Dashboard</DesktopNavLink>
          <DesktopNavLink to="/jogos">Jogos</DesktopNavLink>
          <DesktopNavLink to="/ranking">Ranking</DesktopNavLink>
          <DesktopNavLink to="/ligas">Ligas</DesktopNavLink>
          <DesktopNavLink to="/perfil">Perfil</DesktopNavLink>
          {profile?.isAdmin && (
            <DesktopNavLink to="/admin">Admin</DesktopNavLink>
          )}
        </div>
      </nav>
    </div>
  );
}

function MobileNavLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-1 py-3 text-[10px] ${
          isActive ? 'text-emerald-400' : 'text-slate-400'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

function DesktopNavLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-medium ${
          isActive
            ? 'bg-emerald-500 text-slate-950'
            : 'bg-white/5 text-slate-300 hover:bg-white/10'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
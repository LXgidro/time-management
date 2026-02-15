import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { meApi } from '../api/auth';
import { Cog6ToothIcon, ArrowLeftStartOnRectangleIcon } from '../icons/Icons';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/', label: 'Главная' },
  { to: '/projects', label: 'Проекты' },
  { to: '/analytics', label: 'Аналитика' },
] as const;

const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-gray-900 underline' : 'text-gray-600 hover:text-gray-900'
  }`;

function AppLayout() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const token = useAppStore((s) => s.token);
  const setAuth = useAppStore((s) => s.setAuth);
  const logout = useAppStore((s) => s.logout);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      logout();
      setIsLoading(false);
      return;
    }

    if (user) {
      setIsLoading(false);
      return;
    }

    const loadMe = async () => {
      try {
        const me = await meApi();
        setAuth({
          user: {
            _id: me._id,
            email: me.email,
            username: me.username || '',
          },
          token,
        });
      } catch {
        toast.error('Не удалось загрузить пользователя');
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadMe();
  }, [token, user, setAuth, logout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    closeMenu();
    navigate('/login');
  }, [logout, closeMenu, navigate]);

  const handleSettingsClick = useCallback(() => {
    closeMenu();
    navigate('/settings');
  }, [closeMenu, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-100 border-b border-orange-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <nav className="flex items-center gap-6">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={getNavLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                ref={buttonRef}
                onClick={toggleMenu}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.username || user.email || 'Пользователь'}
                  </p>
                  {user.email && user.username && (
                    <p className="text-xs text-gray-600">{user.email}</p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold border-2 border-white shadow">
                  {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              </div>

              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-gray-200  shadow-lg z-50"
                >
                  <div
                    onClick={handleSettingsClick}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-t-lg text-sm text-gray-700 hover:bg-orange-300 transition-colors cursor-pointer"
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    Настройки
                  </div>

                  <div className="border-t border-gray-200 "></div>

                  <div
                    onClick={handleLogout}
                    className="flex items-center rounded-b-lg gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
                    Выйти
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;

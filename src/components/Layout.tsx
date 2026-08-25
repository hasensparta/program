import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, PiggyBank, ArrowLeftRight, BarChart3, Trophy, Settings, Plus, Menu, X, Moon, Sun } from 'lucide-react';
import { useStore } from '../store/useStore';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: 'الرئيسية', icon: Home },
  { path: '/jars', label: 'الحصالات', icon: PiggyBank },
  { path: '/transactions', label: 'المعاملات', icon: ArrowLeftRight },
  { path: '/statistics', label: 'الإحصائيات', icon: BarChart3 },
  { path: '/achievements', label: 'الإنجازات', icon: Trophy },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { settings, updateSettings } = useStore();

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">🐖 حصالة</h1>
          <button onClick={() => navigate('/jars/new')} className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">🐖 حصالة</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="py-2">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:w-64 lg:flex lg:flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">🐖 حصالة</h1>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 mx-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={() => navigate('/jars/new')} className="w-full btn-primary">
            <Plus className="w-5 h-5" />
            حصالة جديدة
          </button>
          <button onClick={toggleDarkMode} className="w-full mt-2 btn-secondary">
            {settings.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {settings.darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-5">
          {navItems.slice(0, 5).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-500 dark:text-gray-400'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label.split(' ')[0]}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, CalendarDays, History,
  Menu, X, TrendingUp, LogOut, User
} from 'lucide-react';

const navItems = [
  { to: '/',         label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/plans',    label: 'Payment Plans',   icon: CreditCard },
  { to: '/schedule', label: 'Payment Schedule', icon: CalendarDays },
  { to: '/history',  label: 'Payment History', icon: History },
];

export default function Sidebar({ open, onToggle, user, onLogout }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email       = user?.email || '';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 w-64 bg-[#0f2a5c] text-white flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-base leading-tight">PayTracker</p>
              <p className="text-xs text-blue-300">Payment Manager</p>
            </div>
          </div>
          <button onClick={onToggle} className="lg:hidden text-blue-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Simplified sidebar – no user info or logout */}
        <div className="px-4 py-4 border-t border-blue-800/50">
          <p className="text-xs text-blue-300 text-center">PayTracker</p>
        </div>
      </aside>

      {/* Mobile menu button */}
      {!open && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-20 lg:hidden bg-[#0f2a5c] text-white p-2 rounded-lg shadow-lg"
        >
          <Menu size={20} />
        </button>
      )}
    </>
  );
}

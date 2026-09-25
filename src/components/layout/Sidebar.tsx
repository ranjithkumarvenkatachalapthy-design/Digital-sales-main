import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Receipt,
  History,
  BarChart3,
  Settings,
  LogOut,
  X,
  Store,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemDef {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { stats } = useProducts();
  const navigate = useNavigate();

  const totalAlerts = stats.lowStockCount + stats.outOfStockCount;

  const mainNavItems: NavItemDef[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Products',
      path: '/products',
      icon: Package,
      badge: stats.totalProducts > 0 ? String(stats.totalProducts) : undefined,
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: Boxes,
      badge: totalAlerts > 0 ? `${totalAlerts} alert${totalAlerts > 1 ? 's' : ''}` : undefined,
    },
    {
      label: 'Sales / Billing',
      path: '/sales',
      icon: Receipt,
    },
    {
      label: 'Sales History',
      path: '/sales-history',
      icon: History,
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: BarChart3,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } border-r border-slate-800 shadow-xl lg:shadow-none`}
      >
        {/* Brand Area */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <Store className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">
                  DigitalSales
                </span>
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-indigo-400 px-1.5 py-0.5 rounded border border-slate-700/80">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight leading-tight mt-0.5">
                Inventory • Billing • Sales Analytics
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-white'
                          }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-medium bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Section (Settings & Logout) */}
        <div className="p-3 border-t border-slate-800/80 space-y-1 bg-slate-900/60">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            System
          </div>

          <NavLink
            to="/settings"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`
            }
          >
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-white" />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            type="button"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-left group cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
            <span>Logout</span>
          </button>

          {/* User Preview */}
          <div className="mt-3 pt-3 border-t border-slate-800/60 px-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-indigo-400">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'admin@digitalsales.local'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, User as UserIcon, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  description?: string;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  description,
  onOpenMobileMenu,
}) => {
  const { user, logout, isSupabaseConnected } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left zone: Mobile toggle + Page Title & context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          type="button"
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {isSupabaseConnected ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Supabase Connected
              </span>
            ) : null}
          </div>
          {description && (
            <p className="text-xs text-slate-500 hidden sm:block truncate max-w-md">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right zone: User profile menu */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            type="button"
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left focus:outline-none cursor-pointer"
            aria-expanded={dropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.name || 'Admin'}
              </p>
              <p className="text-[11px] text-slate-500 capitalize">
                {user?.role || 'Administrator'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.email || 'admin@digitalsales.local'}
                </p>
              </div>

              <div className="py-1">
                <div className="px-3.5 py-1.5 text-xs text-slate-600 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Role: <strong className="capitalize">{user?.role || 'Admin'}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account & Settings</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

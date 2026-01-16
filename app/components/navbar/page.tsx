'use client';

import React, { useState } from 'react';
import { Home, Search, Shuffle, MapPin, LayoutDashboard, BarChart3, Menu, X, LogIn, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const JFinderLogo = () => (
  <div className="relative w-8 h-8 flex items-center justify-center">
    <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-40 animate-pulse"></div>
    <svg className="w-8 h-8 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="#38bdf8" strokeWidth="2" fill="none" />
      <path d="M12 6L6 12L12 18L18 12L12 6Z" fill="#0ea5e9" className="opacity-80" />
    </svg>
  </div>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();

  // Define Nav Items based on Role
  const getNavItems = () => {
    // Common items
    const items = [
      { name: 'Home', href: '/', icon: Home },
      { name: 'Tìm Kiếm', href: '/search', icon: Search },
    ];

    const role = session?.user?.role;

    // Tenant Items (Only for logged in Tenants)
    if (role === 'TENANT') {
      items.push({ name: 'AI Analysis', href: '/analysis', icon: Shuffle });
    }

    // Landlord specific
    if (role === 'LANDLORD') {
      items.push({ name: 'Landlord', href: '/landlord', icon: MapPin });
    }

    // Role-based Access
    if (role) {
      // Both Tenant and Landlord can access Dashboard and BI
      items.push({ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard });
      items.push({ name: 'BI (Superset)', href: '/bi-dashboard', icon: BarChart3 });
    }

    return items;
  };

  const navItems = getNavItems();

  // @ts-ignore
  const NavLink = ({ item, onClick }: { item: { name: string; href: string; icon: React.ElementType }; onClick: () => void }) => {
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full
                   text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]
                   transition-all duration-300 group border border-transparent hover:border-white/10"
      >
        <Icon className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        {item.name}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#020617]/50 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Brand */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            <JFinderLogo />
            <span className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 group-hover:to-cyan-300 transition-all duration-500">
              JFinder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
            {navItems.map((item) => (
              <NavLink key={item.name} item={item} onClick={() => { }} />
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                  className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-full transition-colors focus:outline-none"
                >
                  <div className="text-right hidden lg:block">
                    <div className="text-sm font-bold text-white">{session.user?.name}</div>
                    <div className="text-xs text-cyan-400 font-bold">{session.user?.role || 'USER'}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <User className="w-5 h-5" />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl py-2 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-white/10 lg:hidden">
                      <div className="text-sm font-bold text-white">{session.user?.name}</div>
                      <div className="text-xs text-cyan-400">{session.user?.role}</div>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Xem thông tin
                    </Link>

                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
                               text-white font-bold rounded-full shadow-lg shadow-cyan-900/20 transition-all hover:scale-105"
              >
                <LogIn className="w-4 h-4" />
                Đăng Nhập
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md
                         text-gray-400 hover:text-white hover:bg-white/10"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isOpen && (
        <div className="md:hidden absolute w-full bg-[#020617]/95 backdrop-blur-xl border-b border-white/10">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.name} item={item} onClick={() => setIsOpen(false)} />
            ))}
            <div className="pt-4 border-t border-white/10 mt-4">
              {session ? (
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-white/5 rounded-lg font-bold"
                >
                  <User className="w-5 h-5" />
                  Đăng Xuất ({session.user?.name})
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-cyan-400 hover:bg-white/5 rounded-lg font-bold"
                >
                  <LogIn className="w-5 h-5" />
                  Đăng Nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Utensils,
  Receipt,
  Wallet,
  FileText,
  Mail,
  Settings,
  BarChart3,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language';

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, toggleLang, t } = useLanguage();

  const navItems = [
    { href: '/', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/members', label: t('members'), icon: Users },
    { href: '/meals', label: t('meals'), icon: Utensils },
    { href: '/expenses', label: t('expenses'), icon: Receipt },
    { href: '/payments', label: t('payments'), icon: Wallet },
    { href: '/reports', label: t('reports'), icon: BarChart3 },
    { href: '/invoices', label: t('invoices'), icon: FileText },
    { href: '/email', label: t('email'), icon: Mail },
    { href: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-200 lg:transform-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold">Mess Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn' ? 'বাংলাদেশ সংস্করণ' : 'Bangladesh Edition'}
          </p>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <Globe className="w-4 h-4" />
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

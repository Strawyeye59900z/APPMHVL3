'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';

const NAV = [
  { href: '/morador',           label: 'Início',     icon: 'home' },
  { href: '/morador/encomendas', label: 'Encomendas', icon: 'box' },
  { href: '/morador/reservas',   label: 'Reservas',   icon: 'calendar' },
  { href: '/morador/perfil',     label: 'Perfil',     icon: 'user' },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bnav">
      {NAV.map((it) => {
        const active = path === it.href;
        return (
          <Link key={it.href} href={it.href} className={`bnav-item${active ? ' active' : ''}`}>
            <Icon n={it.icon} size={22} stroke={active ? 2 : 1.6} />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

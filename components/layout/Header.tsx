'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, LayoutGrid, BookOpen, Settings } from 'lucide-react';

const NAV_LINKS = [
  { href: '/',           label: 'Home',      icon: LayoutGrid },
  { href: '/game',       label: 'Play',      icon: Sparkles },
  { href: '/questions',  label: 'Questions', icon: BookOpen },
  { href: '/settings',   label: 'Settings',  icon: Settings },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(12,14,19,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 20px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🃏</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800, fontSize: 18,
            color: 'var(--text-primary)',
          }}>CrackIt</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 12,
                  fontSize: 14, fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                }}
              >
                <Icon size={15} />
                <span className="nav-label">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile bottom tabs */}
      <style>{`
        .nav-label { display: inline; }
        @media (max-width: 480px) {
          .nav-label { display: none; }
          header nav a { padding: 8px 10px; }
        }
      `}</style>
    </header>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api, logout } from '@/lib/api';

const CAROUSEL_RESIDENTS = [
  { name: 'Ana Lima',     apt: '101', status: 'registered', initials: 'AL' },
  { name: 'Bruno Costa',  apt: '102', status: 'pending',    initials: 'BC' },
  { name: 'Carla Dias',   apt: '103', status: 'registered', initials: 'CD' },
  { name: 'Diego Melo',   apt: '104', status: 'registered', initials: 'DM' },
  { name: 'Eva Santos',   apt: '201', status: 'pending',    initials: 'ES' },
  { name: 'Fábio Reis',   apt: '202', status: 'registered', initials: 'FR' },
  { name: 'Gabi Moura',   apt: '203', status: 'registered', initials: 'GM' },
  { name: 'Hugo Neves',   apt: '301', status: 'pending',    initials: 'HN' },
  { name: 'Iris Prado',   apt: '302', status: 'registered', initials: 'IP' },
  { name: 'Jonas Luz',    apt: '303', status: 'registered', initials: 'JL' },
];

export default function MoradorHome() {
  const [packages, setPackages] = useState<any[]>([]);
  const [aptNum, setAptNum] = useState('');
  const [greeting, setGreeting] = useState('Bom dia');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite');
    api('/packages/me').then(setPackages).catch(() => {});
    // get apt number from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAptNum(payload.name?.replace('AP ', '') || '');
      } catch {}
    }
  }, []);

  const pendingPkgs = packages.filter(p => p.status === 'PENDING');

  // double the list for seamless loop
  const carouselItems = [...CAROUSEL_RESIDENTS, ...CAROUSEL_RESIDENTS];

  return (
    <div className="mobile-page">
      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="label">{greeting}</div>
          <h1 className="disp" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
            AP {aptNum}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {pendingPkgs.length > 0 && (
            <div style={{ position: 'relative' }}>
              <Icon n="bell" size={24} color="var(--ink)" />
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--terra)', color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {pendingPkgs.length}
              </span>
            </div>
          )}
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', padding: 4 }}>
            <Icon n="logout" size={22} />
          </button>
        </div>
      </div>

      {/* Hero number */}
      <div style={{ padding: '12px 20px 16px' }}>
        <div style={{
          background: 'var(--primary)', borderRadius: 20,
          padding: '24px 24px 20px', color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
          <div className="label" style={{ color: 'rgba(255,255,255,.6)' }}>Apartamento</div>
          <div className="disp" style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 4 }}>
            {aptNum || '—'}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{pendingPkgs.length}</div>
              <div style={{ fontSize: 11, opacity: .7 }}>Encomendas</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,.2)' }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>0</div>
              <div style={{ fontSize: 11, opacity: .7 }}>Reservas ativas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { icon: 'box',      label: 'Encomendas', href: '/morador/encomendas' },
          { icon: 'calendar', label: 'Reservas',   href: '/morador/reservas' },
          { icon: 'camera',   label: 'Meu Facial', href: '/morador/facial' },
        ].map(item => (
          <a key={item.href} href={item.href} style={{
            background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 14,
            padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 8, textDecoration: 'none', color: 'var(--ink)',
          }}>
            <Icon n={item.icon} size={22} color="var(--primary)" />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</span>
          </a>
        ))}
      </div>

      {/* Residents carousel */}
      <div style={{ marginTop: 24 }}>
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Moradores</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Residentes do condomínio</p>
          </div>
          <a href="/morador/perfil" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Ver todos</a>
        </div>
        <div className="carousel-wrap" style={{ overflow: 'hidden' }}>
          <div className="carousel-track">
            {carouselItems.map((r, i) => (
              <div key={i} style={{
                background: 'var(--paper)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                minWidth: 100,
              }}>
                <div style={{ position: 'relative' }}>
                  <div className="av" style={{ width: 48, height: 48, fontSize: 15, background: 'var(--primary)', color: '#fff' }}>
                    {r.initials}
                  </div>
                  <span style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 12, height: 12, borderRadius: '50%',
                    background: r.status === 'registered' ? 'var(--sage)' : '#f5a623',
                    border: '2px solid var(--paper)',
                  }} className={r.status === 'pending' ? 'pulse' : ''} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{r.name.split(' ')[0]}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>AP {r.apt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '8px 20px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Facial registrado</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f5a623', display: 'inline-block', marginLeft: 8 }} />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Pendente</span>
        </div>
      </div>

      {/* Pending packages preview */}
      {pendingPkgs.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Encomendas pendentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingPkgs.slice(0, 2).map(p => (
              <div key={p.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--warn-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon n="package" size={20} color="var(--terra)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{p.resident?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {p.type} · {new Date(p.receivedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <Icon n="chev" size={16} color="var(--muted)" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

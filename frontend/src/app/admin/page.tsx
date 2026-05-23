'use client';
import { useEffect, useState } from 'react';
import { Brand } from '@/components/Brand';
import { Icon } from '@/components/Icon';
import { api, logout } from '@/lib/api';

type Tab = 'dashboard' | 'apartments' | 'employees' | 'facial' | 'reservations';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [apartments, setApartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  const [apForm, setApForm] = useState({ number: '', password: '' });
  const [empForm, setEmpForm] = useState({ id: '', name: '', password: '' });

  async function reload() {
    const [apts, emps, res, pkgs] = await Promise.all([
      api('/apartments').catch(() => []),
      api('/employees').catch(() => []),
      api('/reservations').catch(() => []),
      api('/packages/pending').catch(() => []),
    ]);
    setApartments(apts);
    setEmployees(emps);
    setReservations(res);
    setPackages(pkgs);
  }
  useEffect(() => { reload(); }, []);

  async function createApt(e: React.FormEvent) {
    e.preventDefault();
    await api('/apartments', { method: 'POST', body: JSON.stringify(apForm) });
    setApForm({ number: '', password: '' });
    reload();
  }

  async function createEmp(e: React.FormEvent) {
    e.preventDefault();
    await api('/employees', { method: 'POST', body: JSON.stringify(empForm) });
    setEmpForm({ id: '', name: '', password: '' });
    reload();
  }

  async function cancelReservation(id: string) {
    if (!confirm('Cancelar esta reserva?')) return;
    await api(`/reservations/${id}`, { method: 'DELETE' });
    reload();
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const NAV: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard',   label: 'Dashboard',      icon: 'grid'     },
    { id: 'apartments',  label: 'Apartamentos',   icon: 'door'     },
    { id: 'employees',   label: 'Funcionários',   icon: 'user'     },
    { id: 'facial',      label: 'Fila Facial',    icon: 'camera'   },
    { id: 'reservations',label: 'Reservas',       icon: 'calendar' },
  ];

  return (
    <div className="desk-layout" style={{ minHeight: '100dvh' }}>
      {/* Sidebar */}
      <aside className="desk-sidebar">
        <Brand />
        <div className="label" style={{ marginTop: 24, marginBottom: 8 }}>Síndico</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(it => (
            <button key={it.id} className={`nav-item${tab === it.id ? ' active' : ''}`} style={{ width: '100%', border: 'none', textAlign: 'left' }} onClick={() => setTab(it.id)}>
              <Icon n={it.icon} size={18} /> {it.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <div className="divider" style={{ margin: '16px 0' }} />
          <a
            href={`${apiUrl}/api/reservations/report.pdf?days=30`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm btn-w"
            style={{ textDecoration: 'none', justifyContent: 'flex-start', gap: 8 }}
          >
            <Icon n="download" size={15} /> Relatório PDF
          </a>
          <button onClick={logout} className="btn btn-ghost btn-sm btn-w" style={{ marginTop: 6 }}>
            <Icon n="logout" size={15} /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: '32px 40px', overflow: 'auto', background: 'var(--cream)' }}>

        {/* ── Dashboard ── */}
        {tab === 'dashboard' && (
          <div>
            <h1 className="disp" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Apartamentos',  value: apartments.length,  icon: 'door',     color: 'var(--primary)' },
                { label: 'Funcionários',  value: employees.length,   icon: 'user',     color: 'var(--sage)'   },
                { label: 'Encomendas',    value: packages.length,    icon: 'package',  color: 'var(--terra)'  },
                { label: 'Reservas',      value: reservations.length, icon: 'calendar', color: '#7c5cbf'      },
              ].map(card => (
                <div key={card.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: card.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon n={card.icon} size={22} color={card.color} />
                  </div>
                  <div>
                    <div className="disp" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{card.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{card.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Pending packages */}
              <div className="card">
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Encomendas pendentes</h2>
                {packages.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Nenhuma.</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {packages.slice(0, 5).map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <Icon n="package" size={16} color="var(--terra)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>AP {p.apartment?.number} — {p.resident?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.type} · {new Date(p.receivedAt).toLocaleString('pt-BR')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Next reservations */}
              <div className="card">
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Próximas reservas</h2>
                {reservations.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Nenhuma.</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {reservations.slice(0, 5).map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <Icon n="calendar" size={16} color="var(--primary)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.space} · AP {r.apartment?.number}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(r.startsAt).toLocaleString('pt-BR')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Apartments ── */}
        {tab === 'apartments' && (
          <div>
            <h1 className="disp" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Apartamentos</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
              <div className="card">
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Novo apartamento</h2>
                <form onSubmit={createApt} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: 6 }}>Número</label>
                    <input className="input" placeholder="Ex: 101" value={apForm.number} onChange={e => setApForm({ ...apForm, number: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: 6 }}>Senha provisória</label>
                    <input className="input" placeholder="Senha inicial" value={apForm.password} onChange={e => setApForm({ ...apForm, password: e.target.value })} required />
                  </div>
                  <button className="btn btn-primary btn-w">Criar apartamento</button>
                </form>
              </div>
              <div className="card">
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Todos os apartamentos</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                  {apartments.map(a => (
                    <div key={a.id} style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: '14px', textAlign: 'center', background: 'var(--paper)' }}>
                      <div className="disp" style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{a.number}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{a.residents?.length || 0} morador(es)</div>
                    </div>
                  ))}
                  {apartments.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Nenhum cadastrado.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Employees ── */}
        {tab === 'employees' && (
          <div>
            <h1 className="disp" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Funcionários</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
              <div className="card">
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Novo funcionário</h2>
                <form onSubmit={createEmp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: 6 }}>ID</label>
                    <input className="input" placeholder="Ex: 09" value={empForm.id} onChange={e => setEmpForm({ ...empForm, id: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: 6 }}>Nome</label>
                    <input className="input" placeholder="Nome completo" value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: 6 }}>Senha provisória</label>
                    <input className="input" placeholder="Senha inicial" value={empForm.password} onChange={e => setEmpForm({ ...empForm, password: e.target.value })} required />
                  </div>
                  <button className="btn btn-primary btn-w">Criar funcionário</button>
                </form>
              </div>
              <div className="card">
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Equipe</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {employees.map(e => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, background: 'var(--paper)' }}>
                      <div className="av" style={{ width: 40, height: 40, background: 'var(--primary)', color: '#fff', fontSize: 13 }}>
                        {e.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{e.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>ID {e.id}</div>
                      </div>
                      <span className={`badge ${e.mustChangePass ? 'badge-warn' : 'badge-green'}`}>
                        {e.mustChangePass ? 'Aguarda 1º acesso' : 'Ativo'}
                      </span>
                    </div>
                  ))}
                  {employees.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Nenhum cadastrado.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Facial Queue ── */}
        {tab === 'facial' && <FacialQueue />}

        {/* ── Reservations ── */}
        {tab === 'reservations' && (
          <div>
            <h1 className="disp" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Reservas</h1>
            <div className="card">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Espaço', 'AP', 'Início', 'Fim', 'Status', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}><span style={{ fontWeight: 600 }}>{r.space}</span></td>
                      <td style={{ padding: '12px', color: 'var(--muted)' }}>AP {r.apartment?.number}</td>
                      <td style={{ padding: '12px' }}>{new Date(r.startsAt).toLocaleString('pt-BR')}</td>
                      <td style={{ padding: '12px' }}>{new Date(r.endsAt).toLocaleString('pt-BR')}</td>
                      <td style={{ padding: '12px' }}><span className="badge badge-green">Ativa</span></td>
                      <td style={{ padding: '12px' }}>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => cancelReservation(r.id)}>
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Nenhuma reserva ativa.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function FacialQueue() {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  async function loadNext() {
    setLoading(true);
    setCard(await api('/facial-queue/next').catch(() => null));
    setLoading(false);
  }
  useEffect(() => { loadNext(); }, []);

  async function download() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${apiUrl}/api/facial-queue/${card.id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `AP${card.apartmentNumber}_${card.name.replace(/\s+/g, '_')}.jpg`;
    a.click(); URL.revokeObjectURL(url);
  }

  async function markRegistered() {
    await api(`/facial-queue/${card.id}/registered`, { method: 'POST' });
    setDone(true);
    setTimeout(() => { setDone(false); loadNext(); }, 800);
  }

  return (
    <div>
      <h1 className="disp" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Fila de Reconhecimento Facial</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>Baixe a foto, registre na leitora e marque como concluído.</p>

      {loading && <p style={{ color: 'var(--muted)' }}>Carregando…</p>}
      {!loading && !card && (
        <div className="card" style={{ maxWidth: 400, textAlign: 'center', padding: '48px' }}>
          <Icon n="sparkles" size={40} color="var(--sage)" />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 16 }}>Fila vazia!</h2>
          <p style={{ color: 'var(--muted)', marginTop: 8 }}>Todos os moradores com foto estão registrados.</p>
        </div>
      )}

      {card && (
        <div style={{ maxWidth: 400 }}>
          <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
            {/* Tinder-style card */}
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, fontWeight: 700, color: '#fff' }}>
              {card.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="disp" style={{ fontSize: 22, fontWeight: 700 }}>{card.name}</div>
            <div style={{ color: 'var(--muted)', marginTop: 4 }}>AP {card.apartmentNumber}</div>

            <div style={{ marginTop: 8 }}>
              <span className="badge badge-warn">
                <span className="pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--terra)', marginRight: 4 }} />
                Pendente
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={download}>
                <Icon n="download" size={18} /> Baixar foto
              </button>
              <button className="btn btn-sage" onClick={markRegistered} style={{ opacity: done ? .6 : 1 }}>
                {done ? <Icon n="check" size={18} /> : <><Icon n="check" size={18} /> Registrado</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

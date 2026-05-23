'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { api, setSession } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'morador' | 'staff'>('morador');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [pickedStaff, setPickedStaff] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [apt, setApt] = useState('');
  const [moradorPass, setMoradorPass] = useState('');
  const [staffPass, setStaffPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // busca funcionários quando troca para modo portaria
  }, []);

  useEffect(() => {
    if (mode === 'staff' && staffList.length === 0) {
      api('/employees').then(setStaffList).catch(() => setStaffList([]));
    }
  }, [mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (mode === 'morador') {
        const res = await api<any>('/auth/resident/login', {
          method: 'POST',
          body: JSON.stringify({ apartment: apt, password: moradorPass }),
        });
        setSession(res.access_token, 'RESIDENT');
        router.push(res.firstAccessDone ? '/morador' : '/morador/primeiro-acesso');
      } else {
        const staff = staffList[pickedStaff];
        if (!staff) { setErr('Selecione um funcionário.'); setLoading(false); return; }
        const res = await api<any>('/auth/employee/login', {
          method: 'POST',
          body: JSON.stringify({ id: staff.id, password: staffPass }),
        });
        setSession(res.access_token, 'EMPLOYEE');
        router.push(res.mustChangePass ? '/portaria/primeiro-acesso' : '/portaria');
      }
    } catch {
      setErr('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(160deg, #0f2a3a 0%, #1d3a4a 40%, #16506e 75%, #1a6080 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Círculos decorativos */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.03)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '38%', right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

      {/* Topo — ícone + título */}
      <div style={{ flexShrink: 0, padding: '40px 28px 20px', textAlign: 'center', color: '#fff', position: 'relative' }}>
        {/* Ícone do prédio */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="8" width="36" height="34" rx="2" stroke="rgba(255,255,255,.9)" strokeWidth="2"/>
            <rect x="12" y="8" width="24" height="34" fill="rgba(255,255,255,.07)"/>
            <path d="M6 20h36M6 30h36" stroke="rgba(255,255,255,.4)" strokeWidth="1.5"/>
            <rect x="18" y="34" width="12" height="8" rx="1" stroke="rgba(255,255,255,.7)" strokeWidth="1.5"/>
            <rect x="10" y="13" width="5" height="4" rx="1" fill="rgba(255,255,255,.5)"/>
            <rect x="21" y="13" width="5" height="4" rx="1" fill="rgba(255,255,255,.5)"/>
            <rect x="32" y="13" width="5" height="4" rx="1" fill="rgba(255,255,255,.5)"/>
            <rect x="10" y="22" width="5" height="4" rx="1" fill="rgba(255,255,255,.5)"/>
            <rect x="21" y="22" width="5" height="4" rx="1" fill="rgba(255,255,255,.5)"/>
            <rect x="32" y="22" width="5" height="4" rx="1" fill="rgba(255,255,255,.5)"/>
            <path d="M18 8V5h12v3" stroke="rgba(255,255,255,.7)" strokeWidth="1.5"/>
          </svg>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>
          Edifício
        </div>
        <h1 className="disp" style={{ fontSize: 'clamp(18px, 4.5vw, 26px)', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
          Mansão Heitor Villa Lobos
        </h1>
      </div>

      {/* Card de login — ocupa o espaço restante com scroll interno */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          flex: 1,
          background: 'var(--paper)',
          borderRadius: '22px 22px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,.25)',
          overflowY: 'auto',
          padding: '24px 24px 32px',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
          alignSelf: 'flex-end',
          boxSizing: 'border-box',
        }}>

          {/* Toggle Morador / Portaria */}
          <div style={{
            display: 'flex', background: 'var(--border)', borderRadius: 10,
            padding: 3, marginBottom: 20, gap: 3,
          }}>
            {(['morador', 'staff'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErr(''); }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                  background: mode === m ? 'var(--paper)' : 'transparent',
                  color: mode === m ? 'var(--primary)' : 'var(--muted)',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                }}
              >
                {m === 'morador' ? 'Morador / Admin' : 'Portaria'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'morador' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: 6 }}>Apartamento</label>
                  <input className="input" placeholder="Ex: 104" value={apt} onChange={e => setApt(e.target.value)} required />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: 6 }}>Senha</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input" type={showPass ? 'text' : 'password'}
                      placeholder="••••••" value={moradorPass}
                      onChange={e => setMoradorPass(e.target.value)}
                      style={{ paddingRight: 48 }} required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
                      <Icon n="eye" size={18} />
                    </button>
                  </div>
                </div>
                {err && <p style={{ fontSize: 13, color: 'var(--error)', textAlign: 'center' }}>{err}</p>}
                <button className="btn btn-primary btn-w" disabled={loading} style={{ marginTop: 4 }}>
                  {loading ? 'Entrando…' : 'Entrar'}
                </button>
                <button type="button" className="btn btn-ghost btn-w btn-sm" onClick={() => router.push('/admin/login')}>
                  Entrar como Síndico
                </button>
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  Primeiro acesso? Use a senha provisória do síndico.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: 10 }}>Selecione seu perfil</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {staffList.length === 0 && (
                      <p style={{ gridColumn: '1/-1', fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '12px 0' }}>Carregando funcionários…</p>
                    )}
                    {staffList.map((s, i) => (
                      <button
                        key={s.id} type="button" onClick={() => setPickedStaff(i)}
                        style={{
                          border: pickedStaff === i ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                          borderRadius: 12, padding: '10px 6px',
                          background: pickedStaff === i ? 'rgba(29,58,74,.05)' : 'var(--paper)',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                          gap: 6, position: 'relative', transition: 'all .15s',
                        }}
                      >
                        <div className="av" style={{ width: 40, height: 40, fontSize: 13, background: pickedStaff === i ? 'var(--primary)' : 'var(--border)', color: pickedStaff === i ? '#fff' : 'var(--ink-2)' }}>
                          {s.initials}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', textAlign: 'center', lineHeight: 1.2 }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.shift}</div>
                        {pickedStaff === i && (
                          <div style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon n="check" size={10} color="#fff" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {staffList[pickedStaff] && (
                  <div style={{ background: 'var(--cream)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="av" style={{ width: 40, height: 40, background: 'var(--primary)', color: '#fff', fontSize: 13 }}>
                      {staffList[pickedStaff].name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{staffList[pickedStaff].name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>ID {staffList[pickedStaff].id}</div>
                    </div>
                  </div>
                )}

                <div style={{ position: 'relative' }}>
                  <input
                    className="input" type={showPass ? 'text' : 'password'}
                    placeholder="Senha" value={staffPass}
                    onChange={e => setStaffPass(e.target.value)}
                    style={{ paddingRight: 48 }} required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
                    <Icon n="eye" size={18} />
                  </button>
                </div>

                {err && <p style={{ fontSize: 13, color: 'var(--error)', textAlign: 'center' }}>{err}</p>}
                <button className="btn btn-primary btn-w" disabled={loading}>
                  {loading ? 'Entrando…' : `Entrar como ${staffList[pickedStaff]?.name?.split(' ')[0] ?? 'Funcionário'}`}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

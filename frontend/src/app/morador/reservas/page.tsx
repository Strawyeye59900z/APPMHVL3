'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';

const SPACES = [
  { value: 'COURT', label: 'Quadra', icon: 'ball',    desc: 'Por hora · máx. 4h/dia' },
  { value: 'BBQ',   label: 'Churrasqueira', icon: 'fire',  desc: 'Dia inteiro' },
  { value: 'HALL',  label: 'Salão de Festas', icon: 'sparkles', desc: 'Dia inteiro' },
];

export default function Reservas() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [space, setSpace] = useState('COURT');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function reload() {
    setReservations(await api('/reservations').catch(() => []));
  }
  useEffect(() => { reload(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await api('/reservations', { method: 'POST', body: JSON.stringify({ space, startsAt, endsAt }) });
      setShowForm(false);
      setStartsAt(''); setEndsAt('');
      reload();
    } catch (ex: any) {
      setErr(ex.message || 'Horário indisponível.');
    } finally {
      setLoading(false);
    }
  }

  async function cancel(id: string) {
    if (!confirm('Cancelar esta reserva?')) return;
    await api(`/reservations/${id}`, { method: 'DELETE' });
    reload();
  }

  const spaceObj = SPACES.find(s => s.value === space)!;

  return (
    <div className="mobile-page">
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon n="calendar" size={22} color="var(--primary)" />
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Reservas</h1>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <Icon n="plus" size={16} /> Nova
        </button>
      </div>

      {/* New reservation form */}
      {showForm && (
        <div style={{ margin: '0 20px 16px' }}>
          <div className="card">
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Nova reserva</h2>
            {/* Space selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              <label className="label">Espaço</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {SPACES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSpace(s.value)}
                    style={{
                      flex: 1, padding: '10px 6px', borderRadius: 10,
                      border: space === s.value ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      background: space === s.value ? 'rgba(29,58,74,.06)' : 'var(--paper)',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}
                  >
                    <Icon n={s.icon} size={18} color={space === s.value ? 'var(--primary)' : 'var(--muted)'} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: space === s.value ? 'var(--primary)' : 'var(--ink-2)' }}>{s.label}</span>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>{spaceObj.desc}</p>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 6 }}>Início</label>
                <input className="input" type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} required />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 6 }}>Fim</label>
                <input className="input" type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} required />
              </div>
              {err && <p style={{ fontSize: 13, color: 'var(--error)' }}>{err}</p>}
              <button className="btn btn-primary btn-w" disabled={loading}>{loading ? 'Reservando…' : 'Confirmar reserva'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Reservations list */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reservations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Icon n="calendar" size={40} color="var(--border)" />
            <p style={{ color: 'var(--muted)', marginTop: 12 }}>Nenhuma reserva ativa.</p>
          </div>
        )}
        {reservations.map(r => {
          const sp = SPACES.find(s => s.value === r.space);
          return (
            <div key={r.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(29,58,74,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon n={sp?.icon || 'calendar'} size={20} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{sp?.label}</div>
                  <span className="badge badge-green">Ativa</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  AP {r.apartment?.number}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 6 }}>
                  {new Date(r.startsAt).toLocaleString('pt-BR')} → {new Date(r.endsAt).toLocaleString('pt-BR')}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 10, width: '100%', color: 'var(--error)', borderColor: 'var(--error)' }}
                  onClick={() => cancel(r.id)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';

const TYPE_LABEL: Record<string, string> = { BOX: 'Caixa', ENVELOPE: 'Envelope', BAG: 'Sacola' };
const TYPE_ICON: Record<string, string>  = { BOX: 'package', ENVELOPE: 'report', BAG: 'sparkles' };

export default function Encomendas() {
  const [packages, setPackages] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    setPackages(await api('/packages/me').catch(() => []));
    setLoading(false);
  }
  useEffect(() => { reload(); }, []);

  async function pickup(id: string) {
    await api(`/packages/me/${id}/pickup`, { method: 'POST' });
    reload();
  }

  const filtered = packages.filter(p =>
    filter === 'all' ? true :
    filter === 'pending' ? p.status === 'PENDING' : p.status === 'PICKED_UP'
  );

  return (
    <div className="mobile-page">
      <div className="page-header">
        <Icon n="box" size={22} color="var(--primary)" />
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Encomendas</h1>
      </div>

      {/* Filter chips */}
      <div className="scroll-x" style={{ padding: '0 20px 16px' }}>
        <div className="chip-row">
          {([['all', 'Todas'], ['pending', 'Pendentes'], ['done', 'Retiradas']] as const).map(([v, l]) => (
            <button key={v} className={`chip${filter === v ? ' active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>Carregando…</p>}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Icon n="box" size={40} color="var(--border)" />
            <p style={{ color: 'var(--muted)', marginTop: 12 }}>Nenhuma encomenda aqui.</p>
          </div>
        )}
        {filtered.map(p => (
          <div key={p.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: p.status === 'PENDING' ? 'var(--warn-light)' : 'var(--sage-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon n={TYPE_ICON[p.type] || 'package'} size={20} color={p.status === 'PENDING' ? 'var(--terra)' : 'var(--sage)'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{TYPE_LABEL[p.type]}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.resident?.name}</div>
                </div>
                <span className={`badge ${p.status === 'PENDING' ? 'badge-warn' : 'badge-green'}`}>
                  {p.status === 'PENDING' ? 'Pendente' : 'Retirado'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                Recebido {new Date(p.receivedAt).toLocaleString('pt-BR')}
              </div>
              {p.status === 'PENDING' && (
                <button className="btn btn-sage btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={() => pickup(p.id)}>
                  <Icon n="check" size={16} /> Confirmar retirada
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

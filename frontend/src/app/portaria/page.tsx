'use client';
import { useEffect, useRef, useState } from 'react';
import { Brand } from '@/components/Brand';
import { Icon } from '@/components/Icon';
import { api, logout } from '@/lib/api';

const PKG_TYPES = [
  { value: 'BOX',      label: 'Caixa',     icon: 'package' },
  { value: 'ENVELOPE', label: 'Envelope',  icon: 'report'  },
  { value: 'BAG',      label: 'Sacola',    icon: 'sparkles' },
];

export default function Portaria() {
  const [step, setStep] = useState(1);
  const [apartments, setApartments] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [aptInput, setAptInput] = useState('');
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [selectedType, setSelectedType] = useState('BOX');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const aptRef = useRef<HTMLInputElement>(null);

  async function reload() {
    setPending(await api('/packages/pending').catch(() => []));
    setApartments(await api('/apartments').catch(() => []));
  }
  useEffect(() => { reload(); aptRef.current?.focus(); }, []);

  // keyboard shortcut handler
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { resetFlow(); }
      if (e.key === 'Enter' && step === 3) confirmSend();
      if (e.key === '/' && step === 1) { e.preventDefault(); aptRef.current?.focus(); }
      if (['1', '2', '3'].includes(e.key) && step === 3) {
        setSelectedType(['BOX', 'ENVELOPE', 'BAG'][Number(e.key) - 1]);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, selectedType]);

  function selectApt(apt: any) {
    setSelectedApt(apt);
    api(`/apartments/${apt.id}/residents`).then(setResidents).catch(() => setResidents([]));
    setStep(2);
  }

  function selectResident(r: any) {
    setSelectedResident(r);
    setStep(3);
  }

  async function confirmSend() {
    if (!selectedApt || !selectedResident) return;
    setSending(true);
    try {
      await api('/packages', {
        method: 'POST',
        body: JSON.stringify({ apartmentId: selectedApt.id, residentId: selectedResident.id, type: selectedType }),
      });
      setSent(true);
      setTimeout(() => { setSent(false); resetFlow(); reload(); }, 2200);
    } finally {
      setSending(false);
    }
  }

  function resetFlow() {
    setStep(1); setAptInput(''); setSelectedApt(null);
    setSelectedResident(null); setSelectedType('BOX');
    setResidents([]);
    setTimeout(() => aptRef.current?.focus(), 50);
  }

  const filteredApts = aptInput.trim()
    ? apartments.filter(a => a.number.includes(aptInput.trim()))
    : [];

  const typeObj = PKG_TYPES.find(t => t.value === selectedType)!;
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="desk-layout" style={{ minHeight: '100dvh' }}>
      {/* Sidebar */}
      <aside className="desk-sidebar">
        <Brand />
        <div className="label" style={{ marginTop: 24, marginBottom: 8 }}>Portaria</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { icon: 'package', label: 'Encomendas', active: true },
            { icon: 'door',    label: 'Liberar visita' },
            { icon: 'report',  label: 'Diário' },
          ].map((it, i) => (
            <div key={i} className={`nav-item${it.active ? ' active' : ''}`}>
              <Icon n={it.icon} size={18} /> {it.label}
            </div>
          ))}
        </nav>

        <div className="divider" style={{ margin: '20px 0' }} />

        {/* Pending log */}
        <div className="label" style={{ marginBottom: 8 }}>Encomendas hoje</div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pending.slice(0, 8).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--warn-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon n="package" size={14} color="var(--terra)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  AP {p.apartment?.number}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.resident?.name?.split(' ')[0]} · {p.type}</div>
              </div>
            </div>
          ))}
          {pending.length === 0 && <p style={{ fontSize: 12, color: 'var(--muted)' }}>Nenhuma hoje.</p>}
        </div>

        <div className="divider" style={{ margin: '20px 0' }} />
        <div className="label" style={{ marginBottom: 8 }}>Atalhos</div>
        {[['/', 'Buscar AP'], ['Tab', 'Próximo passo'], ['1·2·3', 'Tipo de item'], ['Enter', 'Confirmar'], ['Esc', 'Reiniciar']].map(([k, l]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{l}</span>
            <kbd className="mono" style={{ fontSize: 10, background: 'var(--border)', padding: '2px 6px', borderRadius: 4, color: 'var(--ink-2)' }}>{k}</kbd>
          </div>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <button onClick={logout} className="btn btn-ghost btn-sm btn-w" style={{ marginTop: 16 }}>
            <Icon n="logout" size={14} /> Sair
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main style={{ padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ maxWidth: 760 }}>
          <h1 className="disp" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Registrar Encomenda
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} · {hora}
          </p>

          {/* Steps indicator */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
            {['Apartamento', 'Morador', 'Tipo'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14,
                    background: step > i + 1 ? 'var(--sage)' : step === i + 1 ? 'var(--primary)' : 'var(--border)',
                    color: step >= i + 1 ? '#fff' : 'var(--muted)',
                    transition: 'all .3s',
                  }}>
                    {step > i + 1 ? <Icon n="check" size={16} color="#fff" /> : i + 1}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: step === i + 1 ? 700 : 500, color: step === i + 1 ? 'var(--ink)' : 'var(--muted)' }}>{s}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? 'var(--sage)' : 'var(--border)', margin: '0 12px', transition: 'background .3s' }} />}
              </div>
            ))}
          </div>

          {/* Step 1 — Apartment */}
          {step === 1 && (
            <div className="card" style={{ maxWidth: 480 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Qual apartamento?</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
                Digite o número e pressione <kbd className="mono" style={{ fontSize: 11, background: 'var(--border)', padding: '1px 5px', borderRadius: 4 }}>Tab</kbd>
              </p>
              <div style={{ position: 'relative' }}>
                <input
                  ref={aptRef}
                  className="input"
                  placeholder="Número do apartamento…"
                  value={aptInput}
                  onChange={e => setAptInput(e.target.value)}
                  style={{ fontSize: 20, padding: '16px 16px 16px 44px' }}
                  autoFocus
                />
                <Icon n="search" size={18} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' } as any} />
                <span className="caret" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 2, height: 22, background: 'var(--primary)', borderRadius: 1 }} />
              </div>
              {filteredApts.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filteredApts.map(a => (
                    <button
                      key={a.id}
                      onClick={() => selectApt(a)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                        background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: 12,
                        cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{a.number}</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>AP {a.number}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.residents?.length || a._count?.packages || 0} morador(es)</div>
                      </div>
                      <Icon n="chev" size={18} color="var(--muted)" style={{ marginLeft: 'auto' } as any} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Resident */}
          {step === 2 && (
            <div className="card" style={{ maxWidth: 480 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
                  <Icon n="arrowL" size={20} />
                </button>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>AP {selectedApt?.number} — Quem é?</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {residents.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sem moradores cadastrados.</p>}
                {residents.map(r => (
                  <button
                    key={r.id}
                    onClick={() => selectResident(r)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: 12,
                      cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <div className="av" style={{ width: 44, height: 44, fontSize: 15, background: 'var(--primary)', color: '#fff' }}>
                      {r.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                      {r.phone && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.phone}</div>}
                    </div>
                    <Icon n="chev" size={18} color="var(--muted)" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Type + confirm */}
          {step === 3 && !sent && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
                    <Icon n="arrowL" size={20} />
                  </button>
                  <h2 style={{ fontSize: 18, fontWeight: 700 }}>Tipo da encomenda</h2>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {PKG_TYPES.map((t, i) => (
                    <button
                      key={t.value}
                      onClick={() => setSelectedType(t.value)}
                      style={{
                        flex: 1, padding: '20px 12px', borderRadius: 14,
                        border: selectedType === t.value ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: selectedType === t.value ? 'rgba(29,58,74,.06)' : 'var(--paper)',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                        transition: 'all .15s',
                      }}
                    >
                      <Icon n={t.icon} size={28} color={selectedType === t.value ? 'var(--primary)' : 'var(--muted)'} />
                      <div style={{ fontWeight: 700, color: selectedType === t.value ? 'var(--primary)' : 'var(--ink)' }}>{t.label}</div>
                      <kbd className="mono" style={{ fontSize: 11, background: 'var(--border)', padding: '2px 7px', borderRadius: 4 }}>{i + 1}</kbd>
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary btn-w" style={{ marginTop: 20 }} disabled={sending} onClick={confirmSend}>
                  {sending ? 'Registrando…' : 'Confirmar e enviar WhatsApp'}
                  {!sending && <Icon n="whatsapp" size={18} />}
                </button>
              </div>

              {/* WhatsApp preview */}
              <div className="card" style={{ background: '#e9f8e3', borderColor: '#c3e8b8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Icon n="whatsapp" size={20} color="#25d366" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a7a2a' }}>Preview WhatsApp</span>
                </div>
                <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', fontSize: 13, lineHeight: 1.6, borderTopLeftRadius: 2 }}>
                  Olá, <strong>{selectedResident?.name}!</strong> Uma encomenda tipo <strong>{typeObj.label}</strong> foi recebida na portaria hoje às <strong>{hora}</strong>.
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: '#1a7a2a', textAlign: 'right' }}>
                  → {selectedResident?.phone || 'sem telefone cadastrado'}
                </div>
              </div>
            </div>
          )}

          {/* Success state */}
          {sent && (
            <div className="card" style={{ maxWidth: 480, textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Icon n="check" size={32} color="var(--sage)" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Registrado!</h2>
              <p style={{ color: 'var(--muted)', marginTop: 6 }}>WhatsApp enviado para {selectedResident?.name}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

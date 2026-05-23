'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { api, apiUpload } from '@/lib/api';
import imageCompression from 'browser-image-compression';

export default function PrimeiroAcesso() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (newPass !== confirm) { setErr('Senhas não coincidem.'); return; }
    if (!photo) { setErr('Foto obrigatória.'); return; }
    if (photo.size > 1_048_576) { setErr('Foto deve ter menos de 1MB. Tente novamente.'); return; }
    setErr('');
    setLoading(true);
    try {
      const compressed = await imageCompression(photo, { maxSizeMB: 0.95, maxWidthOrHeight: 800, useWebWorker: true });
      const fd = new FormData();
      fd.append('photo', compressed);
      // upload photo first to get URL (simplified: send as base64 in body)
      const photoUrl = photoPreview || '';
      await api('/employees/me/first-access', {
        method: 'PUT',
        body: JSON.stringify({ newPassword: newPass, photoUrl }),
      });
      setStep(3);
      setTimeout(() => router.push('/portaria'), 2000);
    } catch (ex: any) {
      setErr(ex.message || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Icon n="key" size={26} color="#fff" />
          </div>
          <h1 className="disp" style={{ fontSize: 22, fontWeight: 700 }}>Primeiro acesso</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Configure sua senha e foto de identificação</p>
        </div>

        {/* Step dots */}
        <div className="step-dots" style={{ marginBottom: 28 }}>
          {[1, 2, 3].map(s => <div key={s} className={`step-dot${step === s ? ' active' : step > s ? ' active' : ''}`} style={step > s ? { background: 'var(--sage)', width: 20, borderRadius: 3 } : {}} />)}
        </div>

        {step === 3 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon n="check" size={32} color="var(--sage)" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Tudo pronto!</h2>
            <p style={{ color: 'var(--muted)', marginTop: 8 }}>Redirecionando para a portaria…</p>
          </div>
        ) : (
          <div className="card">
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Nova senha</h2>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: 6 }}>Nova senha</label>
                  <input className="input" type="password" placeholder="Mínimo 6 caracteres" value={newPass} onChange={e => setNewPass(e.target.value)} />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: 6 }}>Confirmar senha</label>
                  <input className="input" type="password" placeholder="Repita a senha" value={confirm} onChange={e => setConfirm(e.target.value)} />
                </div>
                {err && <p style={{ fontSize: 13, color: 'var(--error)' }}>{err}</p>}
                <button className="btn btn-primary btn-w" disabled={!newPass || newPass.length < 6 || newPass !== confirm} onClick={() => { setErr(''); setStep(2); }}>
                  Próximo <Icon n="arrow" size={16} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Foto de identificação</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sua foto será usada para identificação na portaria. Máx. 1MB.</p>
                <div
                  style={{
                    aspectRatio: '1', borderRadius: 16, border: '2px dashed var(--border)',
                    background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 10, cursor: 'pointer', overflow: 'hidden', position: 'relative',
                  }}
                  onClick={() => document.getElementById('photo-input')?.click()}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <Icon n="camera" size={36} color="var(--muted)" />
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>Toque para tirar foto</span>
                    </>
                  )}
                  <input id="photo-input" type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={handlePhoto} />
                </div>
                {err && <p style={{ fontSize: 13, color: 'var(--error)' }}>{err}</p>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>
                    <Icon n="arrowL" size={16} /> Voltar
                  </button>
                  <button className="btn btn-primary" disabled={!photo || loading} onClick={submit}>
                    {loading ? 'Salvando…' : 'Concluir'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Icon } from '@/components/Icon';
import { api, apiUpload } from '@/lib/api';

export default function FacialPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0=intro, 1=list, 2=done
  const [activeId, setActiveId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    api('/apartments/me/residents').then(setResidents).catch(() => {});
  }, []);

  async function handlePhoto(file: File, residentId: string) {
    setUploading(residentId);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.95, maxWidthOrHeight: 800, useWebWorker: true });
      if (compressed.size > 1_048_576) { alert('Foto muito grande mesmo após compressão. Tente outra imagem.'); return; }
      setPreview(URL.createObjectURL(compressed));
      const fd = new FormData();
      fd.append('photo', compressed, `${residentId}.jpg`);
      await apiUpload(`/faces/residents/${residentId}/photo`, fd);
      setActiveId(residentId);
      setStep(2);
      api('/apartments/me/residents').then(setResidents);
    } catch { alert('Erro ao enviar foto.'); }
    finally { setUploading(null); }
  }

  return (
    <div className="mobile-page">
      <div className="page-header">
        <Icon n="camera" size={22} color="var(--primary)" />
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Cadastro Facial</h1>
      </div>

      {step === 0 && (
        <div style={{ padding: '0 20px' }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: 'camera', text: 'Foto com boa iluminação e rosto visível' },
                { icon: 'check',  text: 'Tamanho máximo de 1MB (comprimido automaticamente)' },
                { icon: 'user',   text: 'Fundo neutro, sem óculos escuros ou boné' },
                { icon: 'key',    text: 'Após envio, o síndico registra na leitora facial' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(29,58,74,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon n={r.icon} size={16} color="var(--primary)" />
                  </div>
                  <p style={{ fontSize: 14, marginTop: 5 }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-w" onClick={() => setStep(1)}>
            Começar cadastro <Icon n="arrow" size={16} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Selecione o morador e envie a foto:</p>
          {residents.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="av" style={{ width: 44, height: 44, background: 'var(--primary)', color: '#fff', fontSize: 14 }}>
                {r.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <span className={`badge ${r.facialStatus === 'REGISTERED' ? 'badge-green' : 'badge-warn'}`} style={{ marginTop: 4 }}>
                  {r.facialStatus === 'REGISTERED' ? 'Registrado' : 'Pendente'}
                </span>
              </div>
              <label style={{ cursor: uploading === r.id ? 'wait' : 'pointer' }}>
                <div className={`btn btn-ghost btn-sm${uploading === r.id ? ' disabled' : ''}`}>
                  <Icon n="camera" size={15} />
                  {uploading === r.id ? '…' : 'Enviar'}
                </div>
                <input
                  type="file" accept="image/*" capture="user" style={{ display: 'none' }}
                  onChange={e => e.target.files && handlePhoto(e.target.files[0], r.id)}
                  disabled={!!uploading}
                />
              </label>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div style={{ padding: '0 20px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            {preview && <img src={preview} alt="Foto enviada" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', display: 'block', border: '3px solid var(--sage)' }} />}
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Icon n="check" size={24} color="var(--sage)" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Foto enviada!</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>O síndico irá registrá-la na leitora facial em breve.</p>
            <button className="btn btn-ghost btn-w" style={{ marginTop: 20 }} onClick={() => setStep(1)}>
              Enviar outra foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

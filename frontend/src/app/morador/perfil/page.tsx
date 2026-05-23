'use client';
import { useEffect, useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Icon } from '@/components/Icon';
import { api, apiUpload, logout } from '@/lib/api';

export default function Perfil() {
  const [residents, setResidents] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  async function reload() {
    setResidents(await api('/apartments/me/residents').catch(() => []));
  }
  useEffect(() => { reload(); }, []);

  async function addResident(e: React.FormEvent) {
    e.preventDefault();
    await api('/apartments/me/residents', { method: 'POST', body: JSON.stringify({ name, phone }) });
    setName(''); setPhone('');
    reload();
  }

  async function handlePhoto(file: File, residentId: string) {
    setUploading(residentId);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.95, maxWidthOrHeight: 800, useWebWorker: true });
      const fd = new FormData();
      fd.append('photo', compressed, `${residentId}.jpg`);
      await apiUpload(`/faces/residents/${residentId}/photo`, fd);
      reload();
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="mobile-page">
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon n="user" size={22} color="var(--primary)" />
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Perfil</h1>
        </div>
        <button onClick={logout} className="btn btn-ghost btn-sm">
          <Icon n="logout" size={15} /> Sair
        </button>
      </div>

      {/* Residents */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>Moradores do apartamento</h2>
        {residents.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="av" style={{ width: 48, height: 48, fontSize: 15, background: 'var(--primary)', color: '#fff' }}>
              {r.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{r.name}</div>
              {r.phone && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.phone}</div>}
              <span className={`badge ${r.facialStatus === 'REGISTERED' ? 'badge-green' : 'badge-warn'}`} style={{ marginTop: 6 }}>
                {r.facialStatus === 'REGISTERED' ? 'Facial registrado' : 'Facial pendente'}
              </span>
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                capture="user"
                style={{ display: 'none' }}
                ref={activeUploadId === r.id ? fileRef : undefined}
                onChange={e => e.target.files && handlePhoto(e.target.files[0], r.id)}
              />
              <button
                className="btn btn-ghost btn-sm"
                disabled={uploading === r.id}
                onClick={() => {
                  setActiveUploadId(r.id);
                  setTimeout(() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (ev: any) => ev.target.files && handlePhoto(ev.target.files[0], r.id);
                    input.click();
                  }, 0);
                }}
              >
                <Icon n="camera" size={15} />
                {uploading === r.id ? 'Enviando…' : 'Foto'}
              </button>
            </div>
          </div>
        ))}

        {/* Add resident form */}
        <div className="card" style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Adicionar morador</h3>
          <form onSubmit={addResident} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input" placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} required />
            <input className="input" placeholder="WhatsApp (55119...)" value={phone} onChange={e => setPhone(e.target.value)} />
            <button className="btn btn-primary btn-w">
              <Icon n="plus" size={16} /> Adicionar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

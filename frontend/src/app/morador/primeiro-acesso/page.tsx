'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';

export default function PrimeiroAcessoMorador() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== confirm) { setErr('As senhas não coincidem.'); return; }
    if (newPass.length < 6) { setErr('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    setErr(''); setLoading(true);
    try {
      await api('/apartments/me/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });
      router.push('/morador');
    } catch (ex: any) {
      setErr(ex.message || 'Senha atual incorreta.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #0f2a3a 0%, #1d3a4a 40%, #16506e 75%, #1a6080 100%)',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28, color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon n="key" size={26} color="#fff" />
            </div>
          </div>
          <h1 className="disp" style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Bem-vindo!</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, marginTop: 6 }}>
            Defina sua senha pessoal para continuar.
          </p>
        </div>

        <div className="card">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>Senha provisória (atual)</label>
              <input className="input" type="password" placeholder="Enviada pelo síndico" value={oldPass} onChange={e => setOldPass(e.target.value)} required />
            </div>
            <div className="divider" />
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>Nova senha</label>
              <input className="input" type="password" placeholder="Mínimo 6 caracteres" value={newPass} onChange={e => setNewPass(e.target.value)} required />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>Confirmar nova senha</label>
              <input className="input" type="password" placeholder="Repita a nova senha" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            {err && <p style={{ fontSize: 13, color: 'var(--error)' }}>{err}</p>}
            <button className="btn btn-primary btn-w" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Salvando…' : 'Definir senha e entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

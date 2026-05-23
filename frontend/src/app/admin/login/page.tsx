'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand } from '@/components/Brand';
import { Icon } from '@/components/Icon';
import { api, setSession } from '@/lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await api<any>('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSession(res.access_token, 'ADMIN');
      router.push('/admin');
    } catch {
      setErr('Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--cream)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: 32 }}>
          <Brand size="lg" />
          <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 14 }}>Painel do Síndico</p>
        </div>
        <div className="card">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>E-mail</label>
              <input className="input" type="email" placeholder="admin@condominio.local" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 48 }} required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
                  <Icon n="eye" size={18} />
                </button>
              </div>
            </div>
            {err && <p style={{ fontSize: 13, color: 'var(--error)' }}>{err}</p>}
            <button className="btn btn-primary btn-w" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
          </form>
        </div>
        <button onClick={() => router.back()} style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon n="arrowL" size={14} /> Voltar
        </button>
      </div>
    </div>
  );
}

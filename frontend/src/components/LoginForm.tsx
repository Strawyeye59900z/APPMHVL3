'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setSession } from '@/lib/api';

type Field = { name: string; label: string; type?: string };

export function LoginForm({
  title,
  fields,
  endpoint,
  role,
  redirect,
}: {
  title: string;
  fields: Field[];
  endpoint: string;
  role: string;
  redirect: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await api<{ access_token: string }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setSession(res.access_token, role);
      router.push(redirect);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto mt-16 max-w-sm px-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <form onSubmit={submit} className="mt-6 grid gap-3">
        {fields.map((f) => (
          <input
            key={f.name}
            type={f.type || 'text'}
            placeholder={f.label}
            className="rounded border border-slate-300 px-3 py-2"
            value={values[f.name] || ''}
            onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
            required
          />
        ))}
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          disabled={loading}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}

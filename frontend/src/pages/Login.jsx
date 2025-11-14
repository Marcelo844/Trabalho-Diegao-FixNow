import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) return setErr('Preencha e-mail e senha.');
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('fixnow_token', data.token);
      localStorage.setItem('fixnow_role', data.user.role);
      nav(data.user.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/provider');
      } catch (er) {
      const data = er?.response?.data;
      if (data?.needsVerification) {
        return nav(`/verify?email=${encodeURIComponent(email)}`);
      }
      setErr(data?.error || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <section className="auth-wrap">
        <div className="auth-card">
          <h1>Entrar</h1>
          <p className="helper">Acesse sua conta para gerenciar solicitações e serviços.</p>

          {err && <div className="alert">{err}</div>}

          <form onSubmit={submit} className="auth-form">
            <label className="label">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              autoComplete="email"
            />

            <label className="label">Senha</label>
            <div className="input-group">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="toggle-pass" onClick={()=>setShowPass(s=>!s)}>
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="switch">
            Ainda não tem conta? <Link to="/register">Criar conta</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
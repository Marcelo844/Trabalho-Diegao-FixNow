import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [role,setRole] = useState('CLIENT'); // CLIENT | PROVIDER
  const [showPass, setShowPass] = useState(false);
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState('');
  const nav = useNavigate();

  const validate = () => {
    if (!name.trim()) return 'Informe seu nome.';
    if (!email.includes('@')) return 'E-mail inválido.';
    if (password.length < 6) return 'A senha deve ter ao menos 6 caracteres.';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const v = validate();
    if (v) return setErr(v);

    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', { name, email, password, role });
      if (data.needsVerification) {
        return nav(`/verify?email=${encodeURIComponent(email)}&link=${encodeURIComponent(data.verifyLink)}`);
      }
    } catch (er) {
      setErr(er?.response?.data?.error || 'Erro no cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <section className="auth-wrap">
        <div className="auth-card">
          <h1>Criar conta</h1>
          <p className="helper">Leva menos de um minuto para começar.</p>

          {err && <div className="alert">{err}</div>}

          <form onSubmit={submit} className="auth-form">
            <label className="label">Nome</label>
            <input
              placeholder="Ex.: Ana Santos"
              value={name}
              onChange={e=>setName(e.target.value)}
              autoComplete="name"
            />

            <label className="label">E-mail</label>
            <input
              type="email"
              placeholder="voce@exemplo.com"
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
                autoComplete="new-password"
              />
              <button type="button" className="toggle-pass" onClick={()=>setShowPass(s=>!s)}>
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <label className="label">Tipo de conta</label>
            <div className="segmented">
              <button
                type="button"
                className={role === 'CLIENT' ? 'active' : ''}
                onClick={()=>setRole('CLIENT')}
              >Sou Cliente</button>
              <button
                type="button"
                className={role === 'PROVIDER' ? 'active' : ''}
                onClick={()=>setRole('PROVIDER')}
              >Sou Prestador</button>
            </div>

            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Cadastrando…' : 'Cadastrar'}
            </button>
          </form>

          <p className="switch">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
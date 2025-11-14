import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

export default function Verify(){
  const params = new URLSearchParams(useLocation().search);
  const email = params.get('email') || '';
  const link = params.get('link') || '';
  const [msg, setMsg] = useState('');

  const resend = async () => {
    const { data } = await api.post('/auth/resend-verification', { email });
    setMsg(data.message || 'Novo link gerado.');
  };

  return (
    <main className="container">
      <section className="auth-wrap">
        <div className="auth-card" style={{maxWidth:480}}>
          <h1>Verifique seu e-mail</h1>
          <p className="helper">Enviamos um link para <b>{email}</b>. Clique para ativar sua conta.</p>

          {link && (
          <a className="btn btn-full" href="https://mail.google.com/mail/u/0/#inbox" target="_blank" rel="noopener noreferrer">
            Abrir Gmail
          </a>
          )}

          <button className="btn btn-full" onClick={resend}>Reenviar link</button>
          {msg && <div className="alert" style={{marginTop:10}}>{msg}</div>}
        </div>
      </section>
    </main>
  );
}
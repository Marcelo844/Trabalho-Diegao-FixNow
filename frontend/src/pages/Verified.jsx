import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Verified(){
  const nav = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const status = params.get('status'); // ok | expired | already

  useEffect(()=>{
    const id = setTimeout(()=>nav('/login'), 1500); // <- vai para /login
    return () => clearTimeout(id);
  }, [nav]);

  const text = status === 'ok'
    ? 'E-mail verificado com sucesso! Redirecionando para o login…'
    : status === 'already'
      ? 'Seu e-mail já estava verificado. Indo para o login…'
      : 'Link de verificação expirado. Faça login para reenviar o e-mail.';

  return (
    <main className="container">
      <section className="auth-wrap">
        <div className="auth-card" style={{textAlign:'center'}}>
          <h1>Verificação</h1>
          <p className="helper">{text}</p>
        </div>
      </section>
    </main>
  );
}
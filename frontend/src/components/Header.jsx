import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Modal from './Modal.jsx';

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('fixnow_token');
  const role = localStorage.getItem('fixnow_role');
  const [askLogout, setAskLogout] = useState(false);

  const doLogout = () => {
    localStorage.removeItem('fixnow_token');
    localStorage.removeItem('fixnow_role');
    setAskLogout(false);
    navigate('/');
  };

  return (
    <>
      <div className="header">
        <Link to="/" className="logo" style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <img src="/logo_emp.png" alt="FixNow" style={{height:'100px',width:'100px'}} />
        </Link>
        <nav>
          {token ? (
            <>
              <Link className="btn" to="/profile">Perfil</Link>
              {role === 'CLIENT' && <Link className="btn" to="/dashboard/client">Meu painel</Link>}
              {role === 'PROVIDER' && <Link className="btn" to="/dashboard/provider">Meu painel</Link>}
              <button className="btn" onClick={()=>setAskLogout(true)}>Sair</button>
            </>
          ) : (
            <>
              <Link className="btn" to="/login">Entrar</Link>
              <Link className="btn btn-primary" to="/register">Cadastrar</Link>
            </>
          )}
        </nav>
      </div>

      <Modal open={askLogout} title="Sair da conta"
        onClose={()=>setAskLogout(false)}
        actions={
          <>
            <button className="btn" onClick={()=>setAskLogout(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={doLogout}>Sair</button>
          </>
        }>
        Tem certeza de que deseja sair?
      </Modal>
    </>
  );
}
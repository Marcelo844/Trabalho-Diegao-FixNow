import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal.jsx';
import Toast from '../components/Toast.jsx';

export default function Profile(){
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({open:false, msg:''});
  const [askDelete, setAskDelete] = useState(false);

  const load = async () => {
    const { data } = await api.get('/me');
    setUser(data.user);
    setName(data.user.name || '');
    setAvatarUrl(data.user.avatarUrl || '');
  };

  useEffect(()=>{ load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    await api.put('/me', { name, avatarUrl });    
    // atualiza estado local, sem refetch
    setUser(u => ({ ...u, name, avatarUrl }));
    setSaving(false);
    setToast({open:true, msg:'Perfil atualizado!'});
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setAvatarUrl(preview);                         

    const fd = new FormData();
    fd.append('avatar', file);                     
    const { data } = await api.post('/upload/avatar', fd);

    setAvatarUrl(data.avatarUrl);
    setUser(u => ({ ...u, avatarUrl: data.avatarUrl }));
    setToast({open:true, msg:'Foto atualizada!'});
  };

  const resend = async () => {
    await api.post('/auth/resend-verification', { email: user.email });
    setToast({open:true, msg:'Verificação enviada! Confira seu e-mail.'});
  };

  const delAccount = async () => {
    await api.delete('/me');
    localStorage.removeItem('fixnow_token');
    localStorage.removeItem('fixnow_role');
    window.location.href = '/';
  };

  if (!user) return null;

  const imgSrc = avatarUrl || user.avatarUrl || 'https://avatars.githubusercontent.com/u/0?v=4'; 
  
  return (
    <main className="container">
      <section className="auth-wrap">
        <div className="auth-card" style={{maxWidth:720}}>
          <h1>Meu perfil</h1>
          {!user.emailVerified && (
            <div className="alert" style={{display:'flex',justifyContent:'space-between',alignItems:'center', gap:10}}>
              <span>Seu e-mail ainda não foi verificado.</span>
              <button className="btn btn-primary" onClick={resend}>Verificar e-mail</button>
            </div>
          )}

          <div style={{display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap'}}>
            <div style={{display:'grid', gap:10, justifyItems:'center'}}>
              <img
                src={imgSrc}
                alt="avatar"
                style={{width:120, height:120, borderRadius:'50%', objectFit:'cover', border:'1px solid #e5e7eb'}}
              />
              <label className="btn">
                Trocar foto
                <input onChange={onFile} type="file" accept="image/*" style={{display:'none'}} />
              </label>
            </div>

            <form className="auth-form" onSubmit={save} style={{flex:1, minWidth:260}}>
              <label className="label">Nome</label>
              <input value={name} onChange={e=>setName(e.target.value)} />

              <label className="label">E-mail</label>
              <input value={user.email} disabled />

              <label className="label">URL da foto (opcional)</label>
              <input placeholder="https://..." value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} />

              <button className="btn btn-primary btn-full" disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar alterações'}
              </button>
              <button type="button" className="btn btn-full" onClick={()=>setAskDelete(true)}>
                Excluir minha conta
              </button>
            </form>
          </div>
        </div>
      </section>

      <Modal open={askDelete} title="Excluir conta" onClose={()=>setAskDelete(false)}
        actions={
          <>
            <button className="btn" onClick={()=>setAskDelete(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={delAccount}>Excluir definitivamente</button>
          </>
        }>
        Tem certeza? Esta ação é irreversível e também remove seus serviços e solicitações.
      </Modal>

      <Toast open={toast.open} message={toast.msg} onClose={()=>setToast({open:false, msg:''})}/>
    </main>
  );
}
import { useEffect } from 'react';

export default function Toast({ open, message, onClose }) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, 2500);
    return () => clearTimeout(id);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div style={{position:'fixed', bottom:20, right:20, zIndex:60}}>
      <div style={{background:'#111827', color:'#fff', padding:'12px 16px', borderRadius:10, boxShadow:'0 10px 20px rgba(0,0,0,.25)'}}>
        {message}
      </div>
    </div>
  );
}
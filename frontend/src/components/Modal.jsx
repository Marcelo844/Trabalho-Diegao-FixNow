export default function Modal({ open, title, children, onClose, actions }) {
  if (!open) return null;
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.4)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:50
    }}>
      <div style={{background:'#fff', borderRadius:16, width:'min(92vw, 420px)', boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
        <div style={{padding:'16px 18px', borderBottom:'1px solid #e5e7eb', fontWeight:700}}>{title}</div>
        <div style={{padding:'16px 18px'}}>{children}</div>
        <div style={{padding:'12px 16px', display:'flex', gap:8, justifyContent:'flex-end', borderTop:'1px solid #e5e7eb'}}>
          {actions}
        </div>
      </div>
    </div>
  );
}
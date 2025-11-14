const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
const ROLES = ['CLIENT','PROVIDER'];

async function createVerificationToken(prisma, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000*60*60*24);
  await prisma.verificationToken.create({ data: { token, userId, expiresAt } });
  return token;
}

function buildVerifyLink(req, token) {
  const base = `${req.protocol}://${req.get('host')}`;
  return `${base}/auth/verify?token=${token}`;
}

async function maybeSendEmail(to, link) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return { sent:false };

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE||'false') === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const info = await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject: 'Verifique seu e-mail – Fixnow',
    html: `
      <div style="font-family:Arial,sans-serif;font-size:15px">
        <p>Olá! Clique no botão abaixo para confirmar seu e-mail na Fixnow:</p>
        <p>
          <a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">
            Verificar e-mail
          </a>
        </p>
        <p>Ou copie e cole este link no navegador:<br/><a href="${link}">${link}</a></p>
        <p>Se você não solicitou, ignore este e-mail.</p>
      </div>
    `,
  });
  return { sent:true, messageId: info.messageId };
}

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ ok:false, error:'name, email, password, role são obrigatórios' });
  }
  if (!ROLES.includes(role)) return res.status(400).json({ ok:false, error:'role inválido' });

  const exists = await req.prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ ok:false, error:'E-mail já cadastrado' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await req.prisma.user.create({
    data: { name, email, passwordHash, role, emailVerified:false }
  });

  const token = await createVerificationToken(req.prisma, user.id);
  const verifyLink = buildVerifyLink(req, token);
  const sent = await maybeSendEmail(email, verifyLink);

  return res.status(201).json({
    ok: true,
    needsVerification: true,
    message: sent.sent ? 'Enviamos um e-mail de verificação.' : 'Conta criada. Use o link para verificar.',
    verifyLink 
  });
});

// RESEND
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  const user = await req.prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ ok:false, error:'Usuário não encontrado' });
  if (user.emailVerified) return res.json({ ok:true, message:'E-mail já verificado.' });

  const token = await createVerificationToken(req.prisma, user.id);
  const verifyLink = buildVerifyLink(req, token);
  const sent = await maybeSendEmail(email, verifyLink);

  res.json({
    ok:true,
    message: sent.sent ? 'Novo e-mail enviado.' : 'Link de verificação gerado.',
    verifyLink 
  });
});


router.get('/verify', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Token ausente');

  const record = await req.prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return res.status(400).send('Token inválido');
  if (record.used) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/verified?status=already`);
  }
  if (record.expiresAt < new Date()) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/verified?status=expired`);
  }

  await req.prisma.user.update({ where: { id: record.userId }, data: { emailVerified:true } });
  await req.prisma.verificationToken.update({ where: { token }, data: { used:true } });

  return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/verified?status=ok`);
});


// LOGIN (bloqueia não verificado)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await req.prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ ok:false, error:'Credenciais inválidas' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ ok:false, error:'Credenciais inválidas' });

  if (!user.emailVerified) {
    return res.status(403).json({ ok:false, error:'E-mail não verificado', needsVerification:true });
  }

  return res.json({ ok:true, token: sign(user), user });
});

module.exports = router;
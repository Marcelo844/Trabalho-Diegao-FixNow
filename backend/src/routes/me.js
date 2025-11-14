const router = require('express').Router();
const auth = require('./auth-middleware');
const bcrypt = require('bcrypt');

router.get('/', auth(true), async (req, res) => {
  const user = await req.prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({
    ok: true,
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      emailVerified: user.emailVerified, avatarUrl: user.avatarUrl
    }
  });
});

router.put('/', auth(true), async (req, res) => {
  const data = {};
  if (req.body.name) data.name = req.body.name;
  if (typeof req.body.avatarUrl === 'string') data.avatarUrl = req.body.avatarUrl;
  if (req.body.password) data.passwordHash = await bcrypt.hash(req.body.password, 10);
  const user = await req.prisma.user.update({ where: { id: req.user.id }, data });
  res.json({
    ok: true,
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      emailVerified: user.emailVerified, avatarUrl: user.avatarUrl
    }
  });
});

router.delete('/', auth(true), async (req, res) => {
  const id = req.user.id;
  await req.prisma.job.deleteMany({ where: { OR:[{ clientId:id }, { providerId:id }] } });
  await req.prisma.service.deleteMany({ where: { providerId:id } });
  await req.prisma.verificationToken.deleteMany({ where: { userId:id } });
  await req.prisma.user.delete({ where: { id } });
  res.json({ ok:true });
});

module.exports = router;
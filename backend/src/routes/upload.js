const router = require('express').Router();
const auth = require('./auth-middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const baseDir = path.resolve(__dirname, '..', '..', 'uploads', 'avatars');
fs.mkdirSync(baseDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, baseDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (_req, file, cb) => {
    const ok = (file.mimetype || '').startsWith('image/');
    cb(ok ? null : new Error('Arquivo precisa ser uma imagem'));
  }
});

router.post('/avatar', auth(true), (req, res, next) => {
  upload.single('avatar')(req, res, function (err) {
    if (err) return res.status(400).json({ ok: false, error: err.message });
    if (!req.file) return res.status(400).json({ ok: false, error: 'Nenhum arquivo enviado (campo "avatar")' });

    const url = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    req.prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl: url } })
      .then(() => res.json({ ok: true, avatarUrl: url }))
      .catch(next);
  });
});

module.exports = router;
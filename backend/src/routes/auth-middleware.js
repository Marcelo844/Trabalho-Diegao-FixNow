const jwt = require('jsonwebtoken');

module.exports = function auth(required = true) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      if (required) return res.status(401).json({ ok: false, error: 'Sem token' });
      req.user = null;
      return next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload; // { id, role, name, email }
      next();
    } catch {
      return res.status(401).json({ ok: false, error: 'Token inválido' });
    }
  };
};
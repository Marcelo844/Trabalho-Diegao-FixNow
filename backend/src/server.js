const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// servir arquivos estáticos de upload
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use((req, _res, next) => { req.prisma = prisma; next(); });

app.use('/auth', require('./routes/auth'));
app.use('/me', require('./routes/me'));
app.use('/services', require('./routes/services'));
app.use('/upload', require('./routes/upload'));   // <— NOVO

app.get('/', (_req, res) => res.json({ ok: true, name: 'FixNow API' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
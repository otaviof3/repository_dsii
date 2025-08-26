const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5044;
const TOKEN = process.env.TOKEN || null;

/* ---------- Utils ---------- */
const toISO = (d) => new Date(d).toISOString();

const normalize = (s = '') =>
  String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const nowISO = () => new Date().toISOString();

/* ---------- Auth (opcional) ---------- */
function authMiddleware(req, res, next) {
  if (!TOKEN) return next(); // sem token -> sem auth
  const header = req.headers.authorization || '';
  const expected = `Bearer ${TOKEN}`;
  if (header === expected) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}
app.use(authMiddleware);

/* ---------- Dados em memória (seed) ---------- */
const events = [
  {
    id: 'evt_123',
    title: 'Conferência de Tecnologia 2025',
    startsAt: '2025-09-15T09:00:00-03:00',
    endsAt: '2025-09-15T18:00:00-03:00',
    location: 'Auditório AMF',
    attendees: [
      {
        id: 'att_001',
        name: 'Ana Souza',
        email: 'ana@exemplo.com',
        document: '123.456.789-00',
        checkedInAt: null
      },
      {
        id: 'att_002',
        name: 'José da Silva',
        email: 'jose@exemplo.com',
        document: '987.654.321-00',
        checkedInAt: null
      },
      {
        id: 'att_003',
        name: 'Marcos Pereira',
        email: 'marcos@exemplo.com',
        document: '111.222.333-44',
        checkedInAt: '2025-09-15T09:32:12-03:00'
      }
    ]
  },
  {
    id: 'evt_456',
    title: 'Simpósio de IA Aplicada',
    startsAt: '2025-10-10T14:00:00-03:00',
    endsAt: '2025-10-10T19:00:00-03:00',
    location: 'Centro de Inovação',
    attendees: [
      {
        id: 'att_101',
        name: 'Bianca Felix',
        email: 'bianca@exemplo.com',
        document: '222.333.444-55',
        checkedInAt: null
      },
      {
        id: 'att_102',
        name: 'Felipe Nunes',
        email: 'felipe@exemplo.com',
        document: '333.444.555-66',
        checkedInAt: null
      }
    ]
  }
];

function findEvent(eventId) {
  return events.find((e) => e.id === eventId);
}

function buildStats(event) {
  const total = event.attendees.length;
  const checkedIn = event.attendees.filter((a) => !!a.checkedInAt).length;
  return { total, checkedIn, absent: total - checkedIn };
}

/* ---------- Rotas ---------- */

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: nowISO() });
});

// LISTAR TODOS OS EVENTOS
app.get('/events', (req, res) => {
  const result = events.map((e) => ({
    id: e.id,
    title: e.title,
    startsAt: e.startsAt,
    endsAt: e.endsAt,
    location: e.location,
    stats: buildStats(e)
  }));
  res.json(result);
});

// DETALHE DO EVENTO
app.get('/events/:id', (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const payload = {
    id: event.id,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    location: event.location,
    stats: buildStats(event)
  };

  res.json(payload);
});

// LISTAR PARTICIPANTES (com busca e paginação)
app.get('/events/:id/attendees', (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const search = normalize(req.query.search || '');
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);

  let list = event.attendees.slice();

  if (search) {
    list = list.filter((a) => {
      const target =
        normalize(a.name) +
        ' ' +
        normalize(a.email) +
        ' ' +
        normalize(a.document);
      return target.includes(search);
    });
  }

  // ordena por nome (asc)
  list.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name)));

  const total = list.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = list.slice(start, end);

  res.json({ data, page, limit, total });
});

// CHECK-IN
app.post('/events/:id/checkin', (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { attendeeId } = req.body || {};
  if (!attendeeId) {
    return res.status(400).json({ error: 'attendeeId is required' });
  }

  const attendee = event.attendees.find((a) => a.id === attendeeId);
  if (!attendee) {
    return res.status(422).json({ error: 'Attendee not in this event' });
  }

  if (attendee.checkedInAt) {
    return res
      .status(409)
      .json({ attendeeId, checkedInAt: attendee.checkedInAt });
  }

  attendee.checkedInAt = nowISO();
  return res.status(201).json({ attendeeId, checkedInAt: attendee.checkedInAt });
});

/* ---------- Start ---------- */
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/waypoint_driver';

app.use(cors());
app.use(express.json());

// Schemas
const StopSchema = new mongoose.Schema({
  id: String,
  name: String,
  address: String,
  status: { type: String, default: 'pending' },
  eta: String,
  items: Number,
  sequence: Number,
}, { timestamps: true });

const DriverSchema = new mongoose.Schema({
  name: String,
  vehicle: String,
  status: { type: String, default: 'offline' },
  currentStop: String,
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  from: String,
  title: String,
  body: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });

const Stop = mongoose.model('Stop', StopSchema);
const Driver = mongoose.model('Driver', DriverSchema);
const Message = mongoose.model('Message', MessageSchema);

async function seed() {
  const stopCount = await Stop.countDocuments();
  if (stopCount === 0) {
    await Stop.insertMany([
      { id: 's1', name: 'Kandy Pharmacy', address: '12 Peradeniya Rd', status: 'current', eta: '08:15', items: 4, sequence: 1 },
      { id: 's2', name: 'Peradeniya Mart', address: '45 Galaha Rd', status: 'pending', eta: '08:45', items: 3, sequence: 2 },
      { id: 's3', name: 'Gampola Grocers', address: '8 Main St', status: 'pending', eta: '09:20', items: 5, sequence: 3 },
      { id: 's4', name: 'Nawalapitiya Store', address: '22 Station Rd', status: 'pending', eta: '10:00', items: 2, sequence: 4 },
    ]);
    await Driver.create({ name: 'Kasun Perera', vehicle: 'Van 04', status: 'on_route', currentStop: 's1' });
    await Message.insertMany([
      { from: 'Dispatch', title: 'Route update', body: 'Stop #3 has been rescheduled.' },
      { from: 'System', title: 'Shift started', body: 'Your shift clock is running.' },
    ]);
    console.log('Seeded driver data');
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'waypoint-driver-api', mongo: mongoose.connection.readyState === 1 });
});

app.get('/api/stops', async (req, res) => {
  try {
    const stops = await Stop.find().sort({ sequence: 1 });
    res.json(stops);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/stops/:id', async (req, res) => {
  try {
    const stop = await Stop.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(stop);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/driver', async (req, res) => {
  try {
    const driver = await Driver.findOne();
    res.json(driver);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Waypoint Driver API', endpoints: ['/api/health', '/api/stops', '/api/driver', '/api/messages'] });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await seed();
    app.listen(PORT, '0.0.0.0', () => console.log(`Driver API listening on :${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();

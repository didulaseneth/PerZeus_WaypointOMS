const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/waypoint_loader';

app.use(cors());
app.use(express.json());

const RunSchema = new mongoose.Schema({
  id: String,
  label: String,
  vehicle: String,
  dock: String,
  totalItems: Number,
  loadedItems: Number,
  status: String,
  viewOnly: Boolean,
}, { timestamps: true });

const ItemSchema = new mongoose.Schema({
  sku: String,
  name: String,
  qty: String,
  zone: String,
  status: { type: String, default: 'pending' },
  runId: String,
}, { timestamps: true });

const StopSchema = new mongoose.Schema({
  id: String,
  name: String,
  items: Number,
  zone: String,
  status: String,
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  from: String,
  time: String,
  title: String,
  subtitle: String,
  kind: String,
}, { timestamps: true });

const Run = mongoose.model('Run', RunSchema);
const Item = mongoose.model('Item', ItemSchema);
const Stop = mongoose.model('Stop', StopSchema);
const Message = mongoose.model('Message', MessageSchema);

async function seed() {
  if ((await Run.countDocuments()) === 0) {
    await Run.insertMany([
      { id: '204', label: 'Run #204', vehicle: 'Van 04', dock: 'Dock Bay 3', totalItems: 12, loadedItems: 7, status: 'active' },
      { id: '205', label: 'Run #205', vehicle: 'Van 07', dock: 'Dock Bay 1', totalItems: 10, loadedItems: 3, status: 'queued' },
      { id: '206', label: 'Run #206', vehicle: 'Van 02', dock: 'Dock Bay 2', totalItems: 8, loadedItems: 2, status: 'queued', viewOnly: true },
    ]);
    await Item.insertMany([
      { sku: '88213', name: 'Paracetamol 500mg', qty: '24 packs', zone: 'Rear', status: 'pending', runId: '204' },
      { sku: '77341', name: 'Cough Syrup 100ml', qty: '12 packs', zone: 'Mid', status: 'pending', runId: '204' },
      { sku: '66102', name: 'Vitamin C 500mg', qty: '12 packs', zone: 'Front', status: 'pending', runId: '204' },
      { sku: '88214', name: 'Paracetamol 500mg', qty: '24 packs', zone: 'Rear', status: 'pending', runId: '204' },
      { sku: '77342', name: 'Cough Syrup 100ml', qty: '12 packs', zone: 'Mid', status: 'pending', runId: '204' },
      { sku: '66103', name: 'Vitamin C 500mg', qty: '12 packs', zone: 'Front', status: 'pending', runId: '204' },
    ]);
    await Stop.insertMany([
      { id: 's1', name: 'Kandy Pharmacy', items: 4, zone: 'Rear', status: 'current' },
      { id: 's2', name: 'Peradeniya Mart', items: 3, zone: 'Mid', status: 'pending' },
      { id: 's3', name: 'Gampola Grocers', items: 5, zone: 'Front', status: 'pending' },
    ]);
    await Message.insertMany([
      { from: 'Dispatch', time: '9:52 AM', title: 'Route Changed While Offline', subtitle: 'Tap to review', kind: 'route-change' },
    ]);
    console.log('Seeded loader data');
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'waypoint-loader-api', mongo: mongoose.connection.readyState === 1 });
});

app.get('/api/runs', async (req, res) => {
  try {
    const runs = await Run.find();
    res.json(runs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/runs/:id', async (req, res) => {
  try {
    const run = await Run.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(run);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const q = req.query.runId ? { runId: req.query.runId } : {};
    const items = await Item.find(q);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/items/:sku', async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate({ sku: req.params.sku }, req.body, { new: true });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/stops', async (req, res) => {
  try {
    const stops = await Stop.find();
    res.json(stops);
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
  res.json({ message: 'Waypoint Loader API', endpoints: ['/api/health', '/api/runs', '/api/items', '/api/stops', '/api/messages'] });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await seed();
    app.listen(PORT, '0.0.0.0', () => console.log(`Loader API listening on :${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();

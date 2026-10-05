const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/waypoint_store_manager';

app.use(cors());
app.use(express.json());

const OrderSchema = new mongoose.Schema({
  id: String,
  placedOn: String,
  forDelivery: String,
  items: Number,
  expectedArrival: String,
  status: String,
  chilled: Number,
}, { timestamps: true });

const CatalogItemSchema = new mongoose.Schema({
  name: String,
  temp: String,
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
const CatalogItem = mongoose.model('CatalogItem', CatalogItemSchema);

async function seed() {
  if ((await Order.countDocuments()) === 0) {
    await Order.insertMany([
      { id: 'ORD1042', placedOn: 'Oct 3, 3:12 PM', forDelivery: 'Sat, Oct 4', items: 4, expectedArrival: '07:10', status: 'Confirmed', chilled: 3 },
      { id: 'ORD1038', placedOn: 'Oct 2, 2:40 PM', forDelivery: 'Fri, Oct 3', items: 5, expectedArrival: '—', status: 'Deferred', chilled: 2 },
      { id: 'ORD1031', placedOn: 'Oct 1, 1:55 PM', forDelivery: 'Thu, Oct 2', items: 4, expectedArrival: '07:05', status: 'Delivered', chilled: 2 },
      { id: 'ORD1024', placedOn: 'Sep 30, 3:30 PM', forDelivery: 'Wed, Oct 1', items: 6, expectedArrival: '06:58', status: 'Delivered', chilled: 1 },
      { id: 'ORD1019', placedOn: 'Sep 29, 2:10 PM', forDelivery: 'Tue, Sep 30', items: 5, expectedArrival: '07:20', status: 'Issue reported', chilled: 3 },
      { id: 'ORD1011', placedOn: 'Sep 28, 3:50 PM', forDelivery: 'Mon, Sep 29', items: 4, expectedArrival: '07:00', status: 'Delivered', chilled: 2 },
    ]);
    await CatalogItem.insertMany([
      { name: 'Full cream milk 1L (case of 12)', temp: 'Chilled' },
      { name: 'Low-fat yogurt cups (tray of 24)', temp: 'Chilled' },
      { name: 'Fresh bread loaves (each)', temp: 'Ambient' },
      { name: 'Chicken breast (kg)', temp: 'Chilled' },
      { name: 'Bananas (kg)', temp: 'Ambient' },
      { name: 'Frozen peas (bag)', temp: 'Chilled' },
      { name: 'Eggs (tray of 30)', temp: 'Chilled' },
      { name: 'Bottled water 500ml (case of 24)', temp: 'Ambient' },
    ]);
    console.log('Seeded store-manager data');
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'waypoint-store-manager-api', mongo: mongoose.connection.readyState === 1 });
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/catalog', async (req, res) => {
  try {
    const items = await CatalogItem.find();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Waypoint Store Manager API', endpoints: ['/api/health', '/api/orders', '/api/catalog'] });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await seed();
    app.listen(PORT, '0.0.0.0', () => console.log(`Store Manager API listening on :${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();

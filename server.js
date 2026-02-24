const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.DATABRICKS_APP_PORT || process.env.PORT || 3001;
const CSV_PATH = path.join(__dirname, 'data', 'customers.csv');

app.use(cors());
app.use(express.json());

// Serve built React app in production
app.use(express.static(path.join(__dirname, 'build')));

// --- CSV helpers ---

function parseCsv(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    return headers.reduce((obj, h, i) => {
      obj[h] = h === 'id' ? parseInt(values[i], 10) : (values[i] || '');
      return obj;
    }, {});
  });
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function serializeCsv(customers) {
  const header = 'id,name,address,phone';
  const rows = customers.map(c =>
    `${c.id},"${(c.name || '').replace(/"/g, '""')}","${(c.address || '').replace(/"/g, '""')}","${(c.phone || '').replace(/"/g, '""')}"`
  );
  return [header, ...rows].join('\n');
}

function readCustomers() {
  if (!fs.existsSync(CSV_PATH)) return [];
  return parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
}

function writeCustomers(customers) {
  fs.writeFileSync(CSV_PATH, serializeCsv(customers), 'utf8');
}

function nextId(customers) {
  if (customers.length === 0) return 1;
  return Math.max(...customers.map(c => c.id)) + 1;
}

// --- Routes ---

// GET /api/customers - list all
app.get('/api/customers', (req, res) => {
  try {
    const customers = readCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read customers' });
  }
});

// GET /api/customers/:id - get one
app.get('/api/customers/:id', (req, res) => {
  try {
    const customers = readCustomers();
    const customer = customers.find(c => c.id === parseInt(req.params.id, 10));
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read customer' });
  }
});

// POST /api/customers - create
app.post('/api/customers', (req, res) => {
  try {
    const { name, address, phone } = req.body;
    if (!name || !address || !phone) {
      return res.status(400).json({ error: 'name, address, and phone are required' });
    }
    const customers = readCustomers();
    const newCustomer = { id: nextId(customers), name, address, phone };
    customers.push(newCustomer);
    writeCustomers(customers);
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT /api/customers/:id - update
app.put('/api/customers/:id', (req, res) => {
  try {
    const { name, address, phone } = req.body;
    if (!name || !address || !phone) {
      return res.status(400).json({ error: 'name, address, and phone are required' });
    }
    const customers = readCustomers();
    const index = customers.findIndex(c => c.id === parseInt(req.params.id, 10));
    if (index === -1) return res.status(404).json({ error: 'Customer not found' });
    customers[index] = { id: customers[index].id, name, address, phone };
    writeCustomers(customers);
    res.json(customers[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE /api/customers/:id - delete
app.delete('/api/customers/:id', (req, res) => {
  try {
    const customers = readCustomers();
    const index = customers.findIndex(c => c.id === parseInt(req.params.id, 10));
    if (index === -1) return res.status(404).json({ error: 'Customer not found' });
    const [deleted] = customers.splice(index, 1);
    writeCustomers(customers);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Fallback: serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send('Frontend not built. Run: npm run build');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

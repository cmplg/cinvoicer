import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database tables
async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found. Skipping DB initialization.');
    return;
  }
  
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        is_vendor BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        issue_date DATE NOT NULL,
        due_date DATE,
        status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
        type TEXT DEFAULT 'sale', -- sale (out), purchase (in)
        total_amount DECIMAL(15, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity DECIMAL(12, 2) NOT NULL,
        unit_price DECIMAL(15, 2) NOT NULL,
        tax_rate DECIMAL(5, 2) DEFAULT 0,
        total DECIMAL(15, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS company_settings (
        id SERIAL PRIMARY KEY,
        company_name TEXT NOT NULL DEFAULT 'c-invoicer',
        logo_url TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'user', -- superuser, admin, user
        password TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add password column to users if not exists
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') THEN
          ALTER TABLE users ADD COLUMN password TEXT;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        details TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add payment_method column to invoices if not exists
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='payment_method') THEN
          ALTER TABLE invoices ADD COLUMN payment_method TEXT;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        base_price DECIMAL(15, 2) DEFAULT 0,
        category TEXT, -- service, rental, product
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Seed default settings if not exists
      INSERT INTO company_settings (id, company_name) 
      SELECT 1, 'c-invoicer' 
      WHERE NOT EXISTS (SELECT 1 FROM company_settings WHERE id = 1);

      -- Seed default superuser
      INSERT INTO users (email, name, role)
      SELECT 'mnaslim.grab@gmail.com', 'Owner', 'superuser'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mnaslim.grab@gmail.com');
    `);
    client.release();
    console.log('Database tables initialized or already exist.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

app.use(express.json());

// API: Health & Database Check
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      db: 'connected', 
      time: dbCheck.rows[0].now 
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      db: 'disconnected', 
      message: error.message 
    });
  }
});

// API: Customers
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY name ASC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, c.name as customer_name, c.email as customer_email 
      FROM invoices i 
      LEFT JOIN customers c ON i.customer_id = c.id 
      ORDER BY i.issue_date DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const invoice = await pool.query(`
      SELECT i.*, c.name as customer_name, c.email as customer_email, c.address as customer_address, c.phone as customer_phone
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = $1
    `, [req.params.id]);
    
    const items = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1', [req.params.id]);
    
    if (invoice.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json({ ...invoice.rows[0], items: items.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/invoices/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Dashboard Stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalRevenue = await pool.query("SELECT SUM(total_amount) FROM invoices WHERE status = 'paid'");
    const pendingRevenue = await pool.query("SELECT SUM(total_amount) FROM invoices WHERE status = 'sent'");
    const totalCustomers = await pool.query("SELECT COUNT(*) FROM customers");
    const sentInvoicesCount = await pool.query("SELECT COUNT(*) FROM invoices WHERE status = 'sent'");
    
    // Monthly chart data (last 6 months)
    const monthlyData = await pool.query(`
      SELECT 
        TO_CHAR(issue_date, 'Mon') as month,
        SUM(total_amount) as amount
      FROM invoices
      WHERE status = 'paid'
      GROUP BY month, DATE_TRUNC('month', issue_date)
      ORDER BY DATE_TRUNC('month', issue_date) DESC
      LIMIT 6
    `);

    res.json({
      revenue: parseFloat(totalRevenue.rows[0].sum || 0),
      pending: parseFloat(pendingRevenue.rows[0].sum || 0),
      customers: parseInt(totalCustomers.rows[0].count),
      projects: parseInt(sentInvoicesCount.rows[0].count),
      chart: (monthlyData.rows || []).reverse()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Create Customer
app.post('/api/customers', async (req, res) => {
  const { name, email, phone, address, is_vendor } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO customers (name, email, phone, address, is_vendor) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, address, is_vendor]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Create Invoice
app.post('/api/invoices', async (req, res) => {
  const { invoice_number, customer_id, issue_date, due_date, status, type, total_amount, items } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert invoice
    const invResult = await client.query(
      'INSERT INTO invoices (invoice_number, customer_id, issue_date, due_date, status, type, total_amount, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [invoice_number, customer_id, issue_date, due_date, status, type, total_amount, req.body.payment_method]
    );
    const invoiceId = invResult.rows[0].id;
    
    // Insert items
    for (const item of items) {
      await client.query(
        'INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_rate, total) VALUES ($1, $2, $3, $4, $5, $6)',
        [invoiceId, item.description, item.quantity, item.unit_price, item.tax_rate, item.total]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(invResult.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// API: Company Settings
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM company_settings WHERE id = 1');
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const { company_name, logo_url, address, phone, email, website } = req.body;
  try {
    const result = await pool.query(
      `UPDATE company_settings 
       SET company_name = $1, logo_url = $2, address = $3, phone = $4, email = $5, website = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = 1 
       RETURNING *`,
      [company_name, logo_url, address, phone, email, website]
    );
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Products/Services
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, description, base_price, category } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, base_price, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, base_price, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { email, name, role } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING *',
      [email, name, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Payment Methods
app.get('/api/payment-methods', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payment_methods WHERE is_active = TRUE ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payment-methods', async (req, res) => {
  const { name, details } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO payment_methods (name, details) VALUES ($1, $2) RETURNING *',
      [name, details]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/payment-methods/:id', async (req, res) => {
  try {
    await pool.query('UPDATE payment_methods SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend
async function main() {
  await initDb();
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

main();

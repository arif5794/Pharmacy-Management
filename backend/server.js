const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();

// =====================================================
// CORS CONFIGURATION (UPDATED FOR VERCEL DEPLOYMENT)
// =====================================================
app.use(cors({
  origin: '*', // Allows Vercel frontend requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

app.use(express.json());

// =====================================================
// TEST ROUTES
// =====================================================
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend is running!', timestamp: new Date() });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: '✅ OK', database: '✅ Connected', timestamp: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: '❌ Error', message: err.message });
  }
});

// =====================================================
// PRODUCTS API
// =====================================================

// GET - Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM products';
    let params = [];

    if (search) {
      query += ` WHERE product_name ILIKE $1 OR product_code ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY product_name ASC';
    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Low stock products
app.get('/api/products/stock/low', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE current_quantity <= min_stock_level ORDER BY current_quantity ASC'
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Add new product
app.post('/api/products', async (req, res) => {
  try {
    const {
      product_code,
      product_name,
      category,
      description,
      cost_price,
      selling_price,
      current_quantity,
      min_stock_level,
      unit,
      expiry_date,
      supplier
    } = req.body;

    // Check if product code already exists
    const existing = await pool.query(
      'SELECT id FROM products WHERE product_code = $1',
      [product_code]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Product code already exists!' });
    }

    const result = await pool.query(
      `INSERT INTO products 
        (product_code, product_name, category, description, cost_price, selling_price, 
         current_quantity, min_stock_level, unit, expiry_date, supplier)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        product_code,
        product_name,
        category || null,
        description || null,
        cost_price,
        selling_price,
        current_quantity || 0,
        min_stock_level || 10,
        unit || 'tablet',
        expiry_date || null,
        supplier || null
      ]
    );

    res.status(201).json({ success: true, message: 'Product added!', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_code,
      product_name,
      category,
      description,
      cost_price,
      selling_price,
      current_quantity,
      min_stock_level,
      unit,
      expiry_date,
      supplier
    } = req.body;

    const result = await pool.query(
      `UPDATE products SET
        product_code = $1,
        product_name = $2,
        category = $3,
        description = $4,
        cost_price = $5,
        selling_price = $6,
        current_quantity = $7,
        min_stock_level = $8,
        unit = $9,
        expiry_date = $10,
        supplier = $11,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        product_code,
        product_name,
        category || null,
        description || null,
        cost_price,
        selling_price,
        current_quantity,
        min_stock_level || 10,
        unit || 'tablet',
        expiry_date || null,
        supplier || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated!', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// SALES API (Aligned with daily_sales Schema)
// =====================================================

// GET - Fetch daily sales history
app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.sale_date,
        s.quantity_sold AS quantity,
        s.cost_price_at_sale AS cost_price,
        s.selling_price_at_sale AS unit_price,
        s.total_sale_amount AS total_amount,
        (s.total_sale_amount - (s.cost_price_at_sale * s.quantity_sold)) AS profit,
        p.product_name,
        p.product_code,
        p.unit
      FROM daily_sales s
      JOIN products p ON s.product_id = p.id
      ORDER BY s.created_at DESC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Record sale, deduct stock, log stock history
app.post('/api/sales', async (req, res) => {
  const client = await pool.connect();
  try {
    const { product_id, quantity, sale_date, shopkeeper_id } = req.body;

    const qty = parseInt(quantity, 10);
    const prodId = parseInt(product_id, 10);
    // Default to user ID 1 (admin) if shopkeeper_id is not passed
    const userId = parseInt(shopkeeper_id, 10) || 1; 

    if (!prodId || !qty || qty <= 0) {
      return res.status(400).json({ error: 'Valid product_id and quantity are required' });
    }

    await client.query('BEGIN');

    // 1. Fetch & lock product row
    const productResult = await client.query(
      'SELECT * FROM products WHERE id = $1 FOR UPDATE',
      [prodId]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];

    // 2. Validate stock level
    if (product.current_quantity < qty) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Insufficient stock! Only ${product.current_quantity} ${product.unit || 'item'}(s) available.` 
      });
    }

    const costPrice = parseFloat(product.cost_price);
    const sellingPrice = parseFloat(product.selling_price);
    const totalSaleAmount = sellingPrice * qty;
    const newQuantity = product.current_quantity - qty;

    // 3. Insert into daily_sales table
    const salesResult = await client.query(
      `INSERT INTO daily_sales 
        (sale_date, product_id, quantity_sold, cost_price_at_sale, selling_price_at_sale, total_sale_amount, shopkeeper_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [sale_date || new Date(), prodId, qty, costPrice, sellingPrice, totalSaleAmount, userId]
    );

    // 4. Update products current_quantity
    await client.query(
      `UPDATE products 
       SET current_quantity = $1,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [newQuantity, prodId]
    );

    // 5. Track entry in stock_history table
    await client.query(
      `INSERT INTO stock_history 
        (product_id, previous_quantity, new_quantity, change_reason, quantity_changed, changed_by, notes)
       VALUES ($1, $2, $3, 'sale', $4, $5, 'Daily sale completed')`,
      [prodId, product.current_quantity, newQuantity, qty, userId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Sale recorded and inventory updated successfully!',
      data: salesResult.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// =====================================================
// USERS API
// =====================================================
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, name, phone FROM users'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// ERROR HANDLING
// =====================================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// =====================================================
// START SERVER
// =====================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
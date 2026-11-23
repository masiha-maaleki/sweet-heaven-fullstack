
const express = require("express");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());

// Allow local development frontend
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (
    origin &&
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  next();
});



app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Sweet Heaven API!",
    status: "Server is running"
  });
});


app.get("/api/products", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, category, price,
              image, description, tag
       FROM products
       ORDER BY created_at ASC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Unable to load products"
    });
  }
});





app.get("/api/products/:id", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, category, price,
              image, description, tag
       FROM products
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Unable to load product"
    });
  }
});


app.post("/api/products", async (req, res) => {
  const {
    id,
    name,
    category,
    price,
    image,
    description,
    tag
  } = req.body;

  // Validate required fields
  if (
    typeof id !== "string" ||
    !id.trim() ||
    typeof name !== "string" ||
    !name.trim() ||
    typeof category !== "string" ||
    !category.trim() ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return res.status(400).json({
      message: "Invalid product information"
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO products
       (id, name, category, price, image, description, tag)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, category, price,
                 image, description, tag`,
      [
        id.trim(),
        name.trim(),
        category.trim(),
        price,
        image || null,
        description || null,
        tag || null
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A product with this ID already exists"
      });
    }

    console.error("Database error:", error);

    res.status(500).json({
      message: "Unable to create product"
    });
  }
});


app.patch("/api/products/:id", async (req, res) => {
  const allowedFields = [
    "name",
    "category",
    "price",
    "image",
    "description",
    "tag"
  ];

  const updates = Object.entries(req.body || {})
    .filter(([key]) => allowedFields.includes(key));

  if (updates.length === 0) {
    return res.status(400).json({
      message: "No valid fields to update"
    });
  }

  // Validate input values
  for (const [key, value] of updates) {
    if (key === "price") {
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0
      ) {
        return res.status(400).json({
          message: "Invalid price"
        });
      }
    } else if (
      typeof value !== "string" ||
      ((key === "name" || key === "category") &&
        !value.trim())
    ) {
      return res.status(400).json({
        message: `Invalid value for ${key}`
      });
    }
  }

  const fields = updates.map(
    ([key], index) => `${key} = $${index + 1}`
  );

  const values = updates.map(([, value]) => value);
  values.push(req.params.id);

  try {
    const result = await db.query(
      `UPDATE products
       SET ${fields.join(", ")}
       WHERE id = $${values.length}
       RETURNING id, name, category, price,
                 image, description, tag`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Unable to update product"
    });
  }
});


app.delete("/api/products/:id", async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM products
       WHERE id = $1
       RETURNING id, name`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted successfully",
      deletedProduct: result.rows[0]
    });

  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Unable to delete product"
    });
  }
});

 
app.listen(PORT, () => {
  console.log(
    `Sweet Heaven API running at http://localhost:${PORT}`
  );
});

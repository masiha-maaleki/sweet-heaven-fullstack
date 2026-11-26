

require("dotenv").config();

const { rateLimit } = require("express-rate-limit");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");


const app = express();

const PORT = process.env.PORT || 3000;


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


const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again in 15 minutes."
  }
});


app.post("/api/admin/login", adminLoginLimiter, async (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password
  ) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  try {
    const result = await db.query(
      "SELECT id, username, password_hash FROM admins WHERE username = $1",
      [username.trim()]
    );

    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      return res.status(500).json({
        message: "Server configuration error"
      });
    }

    const token = jwt.sign(
      {
        sub: String(admin.id),
        username: admin.username
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1h"
      }
    );

    return res.json({
      message: "Login successful",
      token,
      tokenType: "Bearer",
      expiresIn: 3600
    });

  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      message: "Unable to log in"
    });
  }
});


function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (
    typeof authHeader !== "string" ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing");

    return res.status(500).json({
      message: "Server configuration error"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    if (!decoded.sub) {
      return res.status(401).json({
        message: "Invalid authentication token"
      });
    }

    
db.query(
  "SELECT id, username FROM admins WHERE id = $1",
  [decoded.sub]
)
  .then((result) => {
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Admin account no longer exists"
      });
    }

    req.admin = {
      id: result.rows[0].id,
      username: result.rows[0].username
    };

    next();
  })
  .catch((error) => {
    console.error("Admin verification error:", error);

    return res.status(500).json({
      message: "Unable to verify admin account"
    });
  });


  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token"
    });
  }
}


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


app.post("/api/products", requireAdmin, async (req, res) => {
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
price < 0 ||
price > 99999999.99 ||
id.trim().length > 100 ||
name.trim().length > 200 ||
category.trim().length > 100 ||
(image != null &&
  (typeof image !== "string" || image.length > 2048)) ||
(description != null &&
  (typeof description !== "string" || description.length > 5000)) ||
(tag != null &&
  (typeof tag !== "string" || tag.length > 100))

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


app.patch("/api/products/:id", requireAdmin, async (req, res) => {
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
        value < 0 ||
        value > 99999999.99
      ) {
        return res.status(400).json({
          message: "Invalid price"
        });
      }
    } else {
      const maxLengths = {
        name: 200,
        category: 100,
        image: 2048,
        description: 5000,
        tag: 100
      };

      if (
        typeof value !== "string" ||
        value.length > maxLengths[key] ||
        (
          (key === "name" || key === "category") &&
          !value.trim()
        )
      ) {
        return res.status(400).json({
          message: `Invalid value for ${key}`
        });
      }
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


app.delete("/api/products/:id", requireAdmin, async (req, res) => {
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

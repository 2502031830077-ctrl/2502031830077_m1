# 🚀 MERN & ExpressJS 4 VS Code Snippets

Welcome! A custom VS Code snippets file has been configured for your workspace. These snippets are designed to speed up your development of **ExpressJS 4** backends and **MERN (MongoDB, Express, React, Node)** stack applications.

To use these snippets, open any Javascript (`.js`), Javascript React (`.jsx`), Typescript (`.ts`), or Typescript React (`.tsx`) file inside this workspace and type the corresponding **Prefix** below, then press `Tab` or `Enter` to expand the template.

---

## 📋 Snippets Reference Table

| Snippet Name | Prefix | Scope (Languages) | Description |
| :--- | :--- | :--- | :--- |
| **Express 4 Server Boilerplate** | `ex-server` | `.js`, `.ts` | Sets up a complete Express server with CORS, dotenv, JSON parsers, and global error handling. |
| **Express Router Module** | `ex-router` | `.js`, `.ts` | Boilerplate for modular route endpoints (GET & POST placeholders). |
| **Express Middleware Function** | `ex-middleware` | `.js`, `.ts` | A template for custom Express request-response cycle middleware. |
| **Express Async Handler Wrapper** | `ex-async-handler` | `.js`, `.ts` | Avoid repetitive `try/catch` blocks in controllers using this clean utility. |
| **Mongoose DB Connection** | `mg-connect` | `.js`, `.ts` | Standard MongoDB connection module with fallback options and logs. |
| **Mongoose Model Template** | `mg-model` | `.js`, `.ts` | MongoDB database schema and model exporter with automatic timestamps. |
| **Mongoose CRUD Routes** | `ex-crud` | `.js`, `.ts` | Complete set of CRUD routes (GET all/one, POST, PUT, DELETE) integrated with a Mongoose model. |
| **JWT Authentication Middleware**| `ex-jwt-auth` | `.js`, `.ts` | Decodes Bearer token and verifies users for route security. |
| **MERN API Fetch Helper** | `mern-fetch` | `.js`, `.jsx`, `.ts`, `.tsx` | Standard React state and `useEffect` template for fetching data from backend APIs. |
| **React MERN Controlled Form** | `re-form` | `.jsx`, `.tsx` | Multi-field controlled React form component that sends POST requests. |

---

## 🛠️ Detailed Code Outlines

### 1. Express Server Boilerplate (`ex-server`)
Sets up a basic node/express entrypoint file (like `server.js` or `app.js`):
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express API' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

---

### 2. Mongoose Model Template (`mg-model`)
Fast creation of MongoDB schemas:
```javascript
const mongoose = require('mongoose');

const ModelNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  }
}, {
  timestamps: true
});

const ModelName = mongoose.model('ModelName', ModelNameSchema);

module.exports = ModelName;
```

---

### 3. Mongoose CRUD Routes (`ex-crud`)
Generates full REST API endpoints for a Mongoose Model in one go:
* `GET /` — Fetch all records.
* `GET /:id` — Fetch a single record.
* `POST /` — Create a new record.
* `PUT /:id` — Update a record (with schema validators run).
* `DELETE /:id` — Delete a record.

---

### 4. React MERN Controlled Form (`re-form`)
Quickly write forms in React that hook directly into your backend endpoints:
```jsx
import React, { useState } from 'react';

const MyForm = () => {
  const [formData, setFormData] = useState({
    field1: '',
    field2: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      console.log('Submission success:', data);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Inputs auto-filled dynamically via tab-stops */}
    </form>
  );
};
```

---

## ⚡ How to customize further
If you want to edit these snippets or add your own, simply edit the configuration file located at:
📂 [express-mern.code-snippets](file:///c:/RAJAN/OJT/.vscode/express-mern.code-snippets)

Happy Coding! 💻🔥

# Digital Menu Backend

Node.js/Express backend for the Digital Menu application.

## Features

- RESTful API for vendors, products, orders, tables, coupons, and customers
- MongoDB integration with in-memory fallback
- Authentication middleware
- Subscription plan management

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/digital-menu
JWT_SECRET=your-secret-key
PORT=3001
```

## Running

```bash
npm run dev
```

The server will run on port 3001.

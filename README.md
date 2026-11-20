# MERN Shop

A starter ecommerce store: product catalogue with search, product pages, cart, user accounts (JWT), checkout (pay on delivery), order history, and an admin page to manage products.

## Setup

Requires Node 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

```bash
# 1. API
cd server
npm install
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm run seed              # sample products + admin user (admin@shop.com / admin123)
npm run dev               # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

## Structure

- `server/` Express + Mongoose API (`/api/auth`, `/api/products`, `/api/orders`)
- `client/` React (Vite) with React Router, cart and auth context

## Next steps

Online payments (Stripe Checkout), image uploads (Cloudinary), order status updates for admin, pagination, reviews, deployment (Render/Railway for the API, Vercel/Netlify for the client).

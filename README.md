# Algonauts CP Helper

A production-ready Competitive Programming management platform for mentors and students.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Git

### Backend Setup
1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your MongoDB Atlas connection string
   - Update JWT secret

4. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
algonauts/
├── backend/              # Node.js + Express API
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Codeforces API integration
│   └── server.js        # Entry point
├── frontend/            # React application
│   └── src/
│       ├── components/  # Reusable components
│       ├── context/     # Auth context
│       ├── pages/       # Page components
│       └── utils/       # API helpers
└── README.md
```

## 🔧 Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express, JWT
- **Database**: MongoDB (Atlas)
- **External API**: Codeforces API

## 📝 Features

- Role-based authentication (Mentor/Student)
- Contest and problem management
- Smart Upsolve Queue algorithm
- Codeforces API integration
- Progress tracking

## 🔗 MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add it to `backend/.env`

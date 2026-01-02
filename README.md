# Algonauts CP Helper

A production-ready Competitive Programming management platform for mentors and students.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Git

### Clone the Repository
```bash
git clone https://github.com/swarnim02/new1.git
cd new1
```

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
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string for JWT signing
     - `PORT`: 3001 (default)

4. Start development server:
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:3001`

### Frontend Setup
1. Open a new terminal and navigate to frontend folder:
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
   Frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
new1/
├── backend/              # Node.js + Express API
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Codeforces API integration
│   ├── .env.example     # Environment variables template
│   ├── .env             # Environment variables (create from .env.example)
│   ├── package.json     # Dependencies
│   └── server.js        # Entry point
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Page components
│   │   ├── utils/       # API helpers
│   │   └── main.jsx     # Entry point
│   ├── package.json     # Dependencies
│   └── vite.config.js   # Vite configuration
└── README.md
```

## 🔧 Tech Stack

- **Frontend**: React 18, Vite, React Router, Axios
- **Backend**: Node.js, Express, JWT, Mongoose
- **Database**: MongoDB (Atlas)
- **External API**: Codeforces API

## 📝 Features

- Role-based authentication (Mentor/Student)
- Group management and student assignment
- Contest and problem management
- Smart Upsolve Queue algorithm
- Codeforces API integration for real-time data
- Progress tracking and statistics
- Problem verification against Codeforces submissions

## 🔗 MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" and select "Drivers"
5. Copy the connection string
6. In `backend/.env`, set:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

## 🔐 Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
PORT=3001
```

## 🚀 Running the Project

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## 🔑 Default Credentials

After setup, create accounts through the registration page:
- Mentor role for group and problem management
- Student role for upsolve and problem solving

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Mentor Routes
- `POST /api/mentor/create-group` - Create a group
- `GET /api/mentor/groups` - Get all groups
- `POST /api/mentor/add-students/:groupId` - Add students to group
- `POST /api/mentor/create-contest/:groupId` - Create contest
- `GET /api/mentor/group-stats/:groupId` - Get group statistics

### Student Routes
- `GET /api/student/upsolve-queue` - Get upsolve queue
- `POST /api/student/bulk-upsolve` - Sync with Codeforces
- `GET /api/student/group-problems` - Get assigned problems
- `POST /api/student/verify-queue` - Verify solved problems

## ⚠️ Troubleshooting

### Backend won't start
- Ensure MongoDB connection string is correct in `.env`
- Check if port 3001 is available
- Run `npm install` again if dependencies are missing

### Frontend can't connect to backend
- Verify backend is running on `http://localhost:3001`
- Check browser console for CORS errors
- Ensure `.env` variables are set correctly

### Codeforces API errors
- Verify Codeforces handle is linked in profile
- Check internet connection
- Codeforces API may have rate limits

## 📝 License

This project is part of Algonauts CP Helper platform.


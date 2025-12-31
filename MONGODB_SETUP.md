# MongoDB Atlas Setup Guide

Follow these steps to get your MongoDB connection string:

## Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or Email
3. Choose **Free Tier (M0)** - it's completely free forever

## Step 2: Create Cluster
1. After login, click **"Create"** or **"Build a Database"**
2. Select **FREE** tier (M0 Sandbox)
3. Choose a cloud provider (AWS recommended)
4. Select a region closest to you
5. Name your cluster (or keep default)
6. Click **"Create Cluster"** (takes 3-5 minutes)

## Step 3: Set Up Database Access
1. In left sidebar, go to **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username (e.g., `algonauts`)
5. **SAVE THIS PASSWORD** - you'll need it later
6. Set user privileges to **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Set Up Network Access
1. In left sidebar, go to **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - IP: `0.0.0.0/0`
4. Click **"Confirm"**

## Step 5: Get Connection String
1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Select **Driver: Node.js**, **Version: 5.5 or later**
5. **Copy the connection string**, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File
1. Open `backend/.env`
2. Replace the placeholders:
   ```
   MONGO_URI=mongodb+srv://algonauts:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/algonauts?retryWrites=true&w=majority
   ```
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add `/algonauts` before the `?` to specify database name

## Step 7: Test Connection
Run the backend server:
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
Server running on port 5000
```

---

## ⚠️ Important Notes
- Never commit `.env` to Git (already in .gitignore)
- Keep your password secure
- Free tier has some limitations but is perfect for development
- Your cluster will not auto-pause if unused for 60 days

## 🆘 Troubleshooting
- **Connection timeout**: Check Network Access settings
- **Authentication failed**: Verify username/password in connection string
- **Can't connect**: Make sure cluster is active (not paused)

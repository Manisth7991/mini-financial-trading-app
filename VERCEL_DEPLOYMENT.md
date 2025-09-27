# 🚀 Vercel Frontend Deployment Guide

## ✅ Changes Made for Vercel Deployment

### 1. Updated API URLs
- ✅ Updated `frontend/src/services/api.js` to use your Render backend
- ✅ Updated `frontend/src/services/adminService.js` for admin APIs
- ✅ Increased timeout to 30 seconds for Render cold starts

### 2. Environment Configuration
- ✅ Updated `frontend/.env` with production API URL
- ✅ Created `vercel.json` configuration file
- ✅ Added build script for Vercel

### 3. Backend CORS Update
- ✅ Updated backend CORS to allow Vercel domains
- ⚠️  **IMPORTANT**: You need to redeploy your backend to Render with the updated CORS settings

## 📋 Deployment Steps

### Step 1: Update Backend on Render
Your backend needs to be redeployed with the new CORS settings:

1. Push the updated `backend/src/server.js` to your repository
2. Redeploy on Render (it should auto-deploy if connected to Git)
3. Verify the backend is running at: https://mini-financial-trading-app-backend.onrender.com

### Step 2: Deploy Frontend to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory
5. Vercel will automatically detect it's a React app
6. Set the following environment variable in Vercel:
   - `REACT_APP_API_URL` = `https://mini-financial-trading-app-backend.onrender.com/api`
7. Click "Deploy"

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

### Step 3: Test the Deployment

After deployment, test these features:
- [ ] Login functionality
- [ ] User registration
- [ ] Product listings load
- [ ] Buy transactions work
- [ ] Portfolio displays correctly
- [ ] Admin dashboard (if admin user)

## 🔧 Expected Vercel URLs

Your app will be available at URLs like:
- `https://mini-financial-trading-app.vercel.app` (main domain)
- `https://mini-financial-trading-app-git-main-[username].vercel.app` (git branch)

## 🐛 Troubleshooting

### If API calls fail:
1. Check browser console for CORS errors
2. Verify backend is running: https://mini-financial-trading-app-backend.onrender.com/api/health
3. Ensure backend was redeployed with new CORS settings

### If pages don't load:
1. Check that `vercel.json` routing is correct
2. Verify build completed successfully in Vercel dashboard

### If environment variables don't work:
1. Set `REACT_APP_API_URL` in Vercel dashboard under Project Settings > Environment Variables
2. Redeploy the frontend

## 📱 Demo Accounts

After deployment, you can test with:

**Regular User:**
- Email: `demo@example.com`
- Password: `demo123`

**Admin User:**
- Email: `admin@tradepro.com`
- Password: `admin123`

## ✅ Deployment Checklist

- [ ] Backend redeployed with new CORS settings
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Login/signup works
- [ ] API calls successful
- [ ] All features working

## 🎯 Your Setup

- **Backend**: https://mini-financial-trading-app-backend.onrender.com
- **Frontend**: Will be `https://[your-project-name].vercel.app`
- **Database**: MongoDB Atlas (already configured)

Ready to deploy! 🚀
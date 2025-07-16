# 🚀 Mind Map Game Deployment Guide

Deploy your Mind Map multiplayer game to the cloud for free using Render (backend) and Netlify (frontend).

## 📋 Prerequisites

- GitHub account
- Render account (free): https://render.com
- Netlify account (free): https://netlify.com
- Your code pushed to a GitHub repository

## 🏗️ Architecture

```
Frontend (Netlify) → Backend (Render) → In-Memory Storage
```

## 🔧 Step 1: Prepare Your Code

### 1.1 Push to GitHub
```bash
# If you haven't already, initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit - Mind Map Game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 1.2 Environment Variables
Your code is already configured with environment variables. You'll set these during deployment.

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Connect your GitHub repository

### 2.2 Deploy Backend
1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

2. **Configure Service**
   - **Name**: `mindmap-game-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set Environment Variables**
   - **NODE_ENV**: `production`
   - **CLIENT_URL**: `https://your-netlify-app.netlify.app` (you'll update this after frontend deployment)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://your-render-app.onrender.com`

### 2.3 Test Backend
Visit `https://your-render-app.onrender.com/health` - you should see:
```json
{"status":"OK","timestamp":"2024-01-01T00:00:00.000Z"}
```

## 🎨 Step 3: Deploy Frontend to Netlify

### 3.1 Create Netlify Account
1. Go to https://netlify.com
2. Sign up with your GitHub account

### 3.2 Deploy Frontend
1. **Create New Site**
   - Click "New site from Git"
   - Choose GitHub
   - Select your repository

2. **Configure Build Settings**
   - **Branch**: `main`
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

3. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add: **VITE_SERVER_URL** = `https://your-render-app.onrender.com`

4. **Deploy**
   - Click "Deploy site"
   - Wait for deployment (2-5 minutes)
   - Note your frontend URL: `https://your-netlify-app.netlify.app`

### 3.3 Update Backend CORS
1. Go back to your Render dashboard
2. Edit your web service
3. Update environment variables:
   - **CLIENT_URL**: `https://your-netlify-app.netlify.app`
4. Save and redeploy

## 🔧 Step 4: Configure Custom Domain (Optional)

### 4.1 Frontend Domain
1. In Netlify: Site Settings → Domain Management
2. Add custom domain
3. Follow DNS configuration instructions

### 4.2 Backend Domain
1. In Render: Settings → Custom Domains
2. Add your custom domain
3. Configure DNS

## 🧪 Step 5: Testing

### 5.1 Test Your Deployed Game
1. Visit your Netlify URL
2. Create a room
3. Open another browser/device
4. Join the room
5. Test full gameplay

### 5.2 Common Issues & Solutions

**Connection Issues:**
- Check CORS settings in backend
- Verify environment variables
- Check browser console for errors

**Deployment Failures:**
- Check build logs in Render/Netlify
- Verify Node.js version compatibility
- Check package.json scripts

## 📊 Step 6: Monitoring & Maintenance

### 6.1 Monitor Performance
- **Render**: Check service logs and metrics
- **Netlify**: Monitor site analytics

### 6.2 Free Tier Limitations
- **Render**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Netlify**: 100GB bandwidth, 300 build minutes/month

### 6.3 Auto-Deploy
Both services auto-deploy when you push to GitHub!

## 🎯 Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Render web service created
- [ ] Backend deployed and accessible
- [ ] Netlify site created
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] Full game tested end-to-end
- [ ] Share your game URL with friends! 🎮

## 🔗 Your URLs

After deployment, save these URLs:
- **Game URL**: `https://your-netlify-app.netlify.app`
- **Backend API**: `https://your-render-app.onrender.com`
- **Health Check**: `https://your-render-app.onrender.com/health`

## 🎉 You're Live!

Your Mind Map game is now live on the internet! Share the frontend URL with friends and start playing!

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Look at service logs in Render/Netlify dashboards
3. Verify all environment variables are set correctly
4. Test locally first to isolate deployment issues

---

**🎮 Happy Gaming!** Your multiplayer Mind Map game is now accessible worldwide! 
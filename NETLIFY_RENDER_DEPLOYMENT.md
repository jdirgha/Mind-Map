# Netlify + Render Deployment Guide

## Overview
This guide will help you deploy your multiplayer Mind Map game using **Netlify** (frontend) and **Render** (backend) - both with free tiers and GitHub integration.

## Prerequisites
- GitHub account
- Netlify account (free)
- Render account (free)
- Your code pushed to GitHub

## Step 1: Deploy Backend to Render

### 1. Go to Render
1. Visit [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub

### 2. Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your `multiplayer` repository
4. Configure:
   - **Name**: `mind-map-backend` (or your choice)
   - **Region**: Choose closest to your location
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Configure Environment Variables
In Render dashboard:
1. Go to your service → Environment tab
2. Add these environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   CLIENT_URL=https://your-netlify-app.netlify.app
   ```

### 4. Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy
3. You'll get a URL like: `https://mind-map-backend.onrender.com`
4. Copy this URL - you'll need it for the frontend

## Step 2: Deploy Frontend to Netlify

### 1. Go to Netlify
1. Visit [netlify.com](https://netlify.com)
2. Click "Sign up" → "GitHub"
3. Authorize Netlify

### 2. Create New Site
1. Click "New site from Git"
2. Choose "GitHub"
3. Select your repository
4. Configure:
   - **Branch**: `main`
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

### 3. Set Environment Variables
1. Go to Site Settings → Environment Variables
2. Add:
   ```
   VITE_SERVER_URL=https://your-render-app.onrender.com
   ```

### 4. Deploy
1. Click "Deploy site"
2. Netlify will build and deploy
3. You'll get a URL like: `https://amazing-app-name.netlify.app`

## Step 3: Update CORS Configuration

### 1. Update Backend CORS
In your `server/index.js`, update the CORS configuration:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.CLIENT_URL,
        'https://your-netlify-app.netlify.app',  // Replace with your Netlify URL
        'https://your-custom-domain.com'         // Optional: add custom domain
      ]
    : ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
};
```

### 2. Update Frontend URL
In your `client/src/services/socket.js`, ensure it points to Render:

```javascript
const getServerUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_SERVER_URL || 
           'https://your-render-app.onrender.com';  // Replace with your Render URL
  }
  return import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
};
```

## Step 4: Test Your Deployment

### Backend Testing
1. **Root URL**: Visit `https://your-render-app.onrender.com/`
   - Should show: Welcome message with server info
   
2. **Health Check**: Visit `https://your-render-app.onrender.com/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

3. **API Info**: Visit `https://your-render-app.onrender.com/api`
   - Should show: Server details and status

### Frontend Test
1. Visit your Netlify URL
2. Create a room
3. Have friends join with the room code
4. Play the game online!

## Step 5: Configure Auto-Deploy

### Netlify Auto-Deploy
1. Go to Site Settings → Build & Deploy
2. Auto-deploy is enabled by default
3. Every push to `main` will trigger a new deployment

### Render Auto-Deploy
1. Go to your service → Settings
2. Auto-deploy is enabled by default
3. Every push to `main` will trigger a new deployment

## Troubleshooting

### Common Issues:

1. **CORS errors**: 
   - Check your Netlify URL is added to CORS origins
   - Verify environment variables are set correctly

2. **Socket connection fails**: 
   - Ensure `VITE_SERVER_URL` points to your Render URL
   - Check if Render service is running

3. **Build failures**: 
   - Check build logs in Netlify/Render dashboard
   - Verify Node.js version compatibility

4. **Cold start delays**: 
   - Render free tier sleeps after 15 minutes of inactivity
   - First request after sleep may take 30 seconds

### Free Tier Limitations:
- **Render**: 750 hours/month, sleeps after 15 minutes inactivity
- **Netlify**: 100GB bandwidth/month, 300 build minutes/month

## Benefits of Netlify + Render

✅ **Completely Free** (within usage limits)
✅ **GitHub Integration** - auto-deploy on push
✅ **Professional URLs** - no ads or restrictions
✅ **SSL/HTTPS** - secure connections by default
✅ **Global CDN** - fast loading worldwide
✅ **WebSocket Support** - real-time multiplayer works perfectly
✅ **Custom Domains** - add your own domain for free

## Monitoring and Maintenance

### Netlify Dashboard:
- View build status and logs
- Monitor bandwidth usage
- Configure custom domains
- Set up form handling

### Render Dashboard:
- Monitor CPU/memory usage
- Check deployment logs
- View real-time metrics
- Scale up if needed

## Production Tips

### Performance Optimization:
1. **Enable caching** in Netlify
2. **Use environment variables** for all configuration
3. **Monitor logs** for errors
4. **Set up uptime monitoring** for Render service

### Security:
1. **Never commit API keys** to GitHub
2. **Use HTTPS** everywhere (automatic with both services)
3. **Validate all inputs** on the backend
4. **Set proper CORS origins**

## Your Live Game URLs

Once deployed, your game will be available at:
- **Frontend**: `https://your-app-name.netlify.app`
- **Backend**: `https://your-backend-name.onrender.com`

**People can play online from anywhere in the world!** 🌍🎮

## Next Steps

1. **Custom Domain**: Add your own domain to Netlify
2. **Analytics**: Set up Netlify Analytics
3. **Monitoring**: Add uptime monitoring for Render
4. **Database**: Upgrade to persistent database if needed
5. **Scaling**: Monitor usage and upgrade if you exceed free limits

Ready to deploy? Follow these steps and your multiplayer game will be live! 
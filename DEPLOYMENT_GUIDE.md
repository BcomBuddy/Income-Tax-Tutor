# BizTutor Deployment Guide

## Current Issues with Netlify Deployment

Your project has both a React frontend and Express.js backend, but Netlify is designed for static sites. This causes deployment issues because:

1. **Netlify can't run Express servers** - it's for static sites only
2. **Missing configuration** - no `netlify.toml` file
3. **API calls fail** - frontend tries to call `/api/*` but there's no backend

## Solution: Separate Frontend and Backend Deployments

### Step 1: Deploy Frontend to Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder, OR
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **The `netlify.toml` file I created will handle:**
   - Build configuration
   - SPA routing (redirects all routes to index.html)
   - Security headers
   - Static asset caching

### Step 2: Deploy Backend to Railway (Recommended)

1. **Go to [railway.app](https://railway.app)**
2. **Sign up/Login with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Railway will auto-detect Node.js**

6. **Add Environment Variables in Railway dashboard:**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=openai/gpt-oss-20b
   PORT=8787
   ```

7. **Railway will give you a URL like:**
   ```
   https://your-app-name.railway.app
   ```

### Step 3: Update Frontend Configuration

1. **Create `.env.local` file in your project root:**
   ```env
   VITE_API_BASE_URL=https://your-app-name.railway.app
   ```

2. **The frontend is already updated** to use the API configuration I created.

### Step 4: Redeploy Frontend

1. **Update your environment variable in Netlify:**
   - Go to your Netlify site dashboard
   - Go to Site settings → Environment variables
   - Add: `VITE_API_BASE_URL` = `https://your-app-name.railway.app`

2. **Redeploy** (Netlify will auto-deploy if connected to GitHub)

## Alternative Backend Hosting Options

### Option 1: Render.com
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Choose "Web Service"
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
5. Add environment variables in dashboard

### Option 2: Heroku
1. Install Heroku CLI
2. Create `Procfile` in root:
   ```
   web: node server/index.js
   ```
3. Deploy with `git push heroku main`

## Testing Your Deployment

1. **Frontend should work** at your Netlify URL
2. **Backend API should work** at your Railway/Render URL
3. **Test the chat functionality** - it should connect to your backend

## Troubleshooting

### If frontend shows errors:
- Check browser console for API errors
- Verify `VITE_API_BASE_URL` is set correctly
- Make sure backend is running and accessible

### If backend fails:
- Check Railway/Render logs
- Verify `GROQ_API_KEY` is set correctly
- Test backend URL directly: `https://your-backend-url.railway.app/api/health`

## File Structure After Deployment

```
project/
├── dist/                    # Built frontend (deployed to Netlify)
├── server/                  # Backend (deployed to Railway/Render)
├── src/                     # Frontend source
├── netlify.toml            # Netlify configuration
├── env.example             # Environment variables template
└── DEPLOYMENT_GUIDE.md     # This guide
```

## Next Steps

1. Deploy backend to Railway/Render
2. Get the backend URL
3. Update `VITE_API_BASE_URL` in Netlify
4. Test the complete application
5. Share your working URLs!

Your app should now work properly on both platforms! 🚀



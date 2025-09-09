# Railway Deployment Guide for Backend

## Steps to deploy your Express server to Railway:

1. **Go to [railway.app](https://railway.app)**
2. **Sign up/Login with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Railway will automatically detect it's a Node.js project**

## Environment Variables Setup:
In Railway dashboard, go to your project → Variables tab and add:
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b
PORT=8787
```

## Railway will give you a URL like:
```
https://your-app-name.railway.app
```

## Update Frontend API Calls:
After getting your Railway URL, update the API calls in your frontend to use the full URL instead of relative paths.

## Alternative: Render.com
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Choose "Web Service"
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
5. Add environment variables in dashboard



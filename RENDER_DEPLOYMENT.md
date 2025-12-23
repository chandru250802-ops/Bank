# Bank Management System - Render Deployment Guide

## Deploy Backend (Flask API) on Render

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Bank Management System"
git remote add origin https://github.com/YOUR_USERNAME/bank-management.git
git push -u origin main
```

### Step 2: Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. **Connect GitHub repository**
   - Authorize Render to access your GitHub
   - Select `bank-management` repository

### Step 3: Configure the Service

| Setting | Value |
|---------|-------|
| **Name** | `bank-api` |
| **Environment** | `Docker` |
| **Region** | `Ohio (us-east)` |
| **Branch** | `main` |
| **Build Command** | (Leave empty - uses Dockerfile) |
| **Start Command** | (Leave empty - uses Dockerfile) |

### Step 4: Add Environment Variables

In Render dashboard, go to **Environment** and add:

```
DATABASE_URL=postgresql://neondb_owner:npg_nIPaFKf2rp6x@ep-crimson-hill-a4ef2pzo-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
FLASK_ENV=production
FLASK_DEBUG=False
```

### Step 5: Deploy Frontend (Static Files)

1. Create a `public` directory with your frontend files
2. On Render, create a **Static Site**:
   - **Connect repository**
   - **Publish directory**: `public`
   - **Build command**: (Leave empty)

### Step 6: Update Frontend API URL

Edit `public/script.js`:

```javascript
const API_BASE_URL = 'https://bank-api.onrender.com'; // Use your Render domain
```

### Step 7: Monitor Deployment

- Check **Logs** tab to see deployment progress
- Once deployed, your API will be available at:
  ```
  https://bank-api.onrender.com
  ```

## Deploy Frontend on Render Static Site

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. **Connect your repository**
4. Set **Publish directory** to `public`
5. Deploy

Your frontend will be available at:
```
https://your-site-name.onrender.com
```

## Local Testing with Docker

### Build Docker Image

```bash
docker build -t bank-api .
```

### Run Container

```bash
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e FLASK_ENV=production \
  bank-api
```

### Using Docker Compose

```bash
docker-compose up -d
```

Then access at `http://localhost:8080`

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is correct in Render environment
- Check Neon PostgreSQL allows connections from Render IP

### Port Issues
- Render automatically assigns a port - use the `PORT` environment variable
- The Dockerfile exposes port 8080 (Render will map it)

### Build Failures
- Check Render logs: **Services** → **Your Service** → **Logs**
- Ensure `requirements.txt` has all dependencies

## Database Management

### Connect to Database from CLI

```bash
psql 'postgresql://neondb_owner:npg_nIPaFKf2rp6x@ep-crimson-hill-a4ef2pzo-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
```

### Useful PostgreSQL Queries

```sql
-- View all users
SELECT * FROM users;

-- View all transactions
SELECT * FROM transactions;

-- Check user balance
SELECT username, balance FROM users WHERE username = 'chandru';

-- View transactions for specific user
SELECT * FROM transactions WHERE user_id = (SELECT id FROM users WHERE username = 'chandru');
```

## Post-Deployment Checklist

- [ ] Backend API deployed on Render
- [ ] Frontend deployed on Render Static Site
- [ ] Environment variables set correctly
- [ ] Database connection verified
- [ ] Frontend API URL updated to Render domain
- [ ] Test registration on production
- [ ] Test deposit/withdrawal functionality
- [ ] Verify transactions are saved in PostgreSQL

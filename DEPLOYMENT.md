# Deployment Guide

This guide will help you deploy your tournament management platform to production.

## Prerequisites

- Node.js v16+ installed
- MongoDB instance (local or cloud like MongoDB Atlas)
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## Quick Start

### 1. Database Setup

#### Option A: MongoDB Atlas (Recommended for production)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

#### Option B: Local MongoDB
```bash
# Install MongoDB (macOS)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongo --eval "db.version()"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your values
nano .env

# Seed admin user (run once)
node src/scripts/seedAdmin.js

# Start the server
npm run dev  # For development
npm start    # For production
```

**Default Admin Credentials:**
- Email: `admin@challonge.local`
- Password: `admin123`

**IMPORTANT:** Change the admin password immediately after first login!

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start the development server
npm start

# Build for production
npm run build
```

### 4. Testing Tournament Creation

1. Start MongoDB (if using local): `brew services start mongodb-community`
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm start`
4. Open browser: http://localhost:3000
5. Register a new account or login with admin credentials
6. Navigate to "Create Tournament"
7. Fill out the form and submit

## Environment Variables

### Backend (.env)

```env
# Required
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/challonge-clone
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
FRONTEND_URL=https://your-frontend-domain.com

# Optional but recommended
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend (.env)

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Production Deployment

### Option 1: Traditional VPS (DigitalOcean, Linode, AWS EC2)

1. **Setup Server**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 (process manager)
   sudo npm install -g pm2

   # Install MongoDB
   # Follow: https://docs.mongodb.com/manual/installation/
   ```

2. **Deploy Backend**
   ```bash
   # Clone repository
   git clone your-repo-url
   cd challonge-clone/backend

   # Install dependencies
   npm install --production

   # Setup environment
   cp .env.example .env
   nano .env

   # Seed admin user
   node src/scripts/seedAdmin.js

   # Start with PM2
   pm2 start src/server.js --name challonge-backend
   pm2 save
   pm2 startup
   ```

3. **Deploy Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build

   # Serve with nginx or any static file server
   sudo apt-get install -y nginx
   sudo cp -r build/* /var/www/html/
   ```

4. **Setup Nginx**
   ```nginx
   # /etc/nginx/sites-available/challonge
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /var/www/html;
           try_files $uri /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 2: Heroku

1. **Backend**
   ```bash
   cd backend
   heroku create challonge-backend
   heroku addons:create mongolab:sandbox
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set FRONTEND_URL=https://your-frontend.herokuapp.com
   git push heroku main
   heroku run node src/scripts/seedAdmin.js
   ```

2. **Frontend**
   ```bash
   cd frontend
   heroku create challonge-frontend
   heroku config:set REACT_APP_API_URL=https://challonge-backend.herokuapp.com/api
   heroku buildpacks:set mars/create-react-app
   git push heroku main
   ```

### Option 3: Vercel + MongoDB Atlas

1. **Backend**: Deploy to Vercel or Railway
2. **Frontend**: Deploy to Vercel
3. **Database**: Use MongoDB Atlas

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel

# Deploy frontend
cd ../frontend
vercel
```

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Monitor logs for suspicious activity

## Troubleshooting

### Tournament creation fails

1. Check MongoDB is running: `mongo --eval "db.version()"`
2. Check backend logs for errors
3. Verify `.env` variables are correct
4. Ensure frontend API URL matches backend URL
5. Check browser console for errors

### Port conflicts

If you see "Port already in use":
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

### MongoDB connection issues

```bash
# Check MongoDB status
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community

# Check logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

## Performance Optimization

1. **Enable compression** in Express:
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Add caching** for static assets

3. **Use CDN** for frontend assets

4. **Database indexing** - Already configured in models

5. **Connection pooling** - Already configured in Mongoose

## Monitoring

- Use PM2 for process management and monitoring
- Set up error logging (e.g., Sentry)
- Monitor MongoDB performance
- Set up uptime monitoring (e.g., UptimeRobot)

## Support

For issues or questions:
1. Check existing issues on GitHub
2. Review logs in `backend/logs/`
3. Enable debug mode: `DEBUG=* npm run dev`

---

**Next Steps:**
1. Run the seed script to create admin user
2. Test tournament creation flow
3. Configure Google OAuth (optional)
4. Set up automated backups
5. Configure monitoring and alerts

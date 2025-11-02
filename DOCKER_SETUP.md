# Docker Setup Guide

This guide covers the complete Docker setup for the Challonge Clone application with all features enabled.

## Features Implemented

✅ **Automatic Admin Seeding** - Admin user is created automatically on first startup
✅ **Redis Integration** - Caching and session storage
✅ **File Upload System** - Tournament banners and logos
✅ **Google OAuth** - Social login support

## Quick Start

### 1. Install Dependencies (Local Development)

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Backend (.env)

Update `backend/.env` with your settings:

```env
# Server Configuration
NODE_ENV=production
PORT=5001
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://mongo:27017/challonge-clone

# JWT Configuration (IMPORTANT: Change in production!)
JWT_SECRET=change-me-to-a-secure-random-string-at-least-32-characters
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_URL=redis://redis:6379

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=/app/uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Google OAuth (Optional - for social login)
# Leave empty to disable Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

### 3. Start Docker Containers

```bash
# From project root
docker-compose up --build
```

This will start:
- **MongoDB** on port 27017
- **Redis** on port 6379
- **Backend** on port 5001
- **Frontend** on port 3000

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **API Health Check**: http://localhost:5001/api/health

## Default Admin Credentials

The Docker setup automatically creates an admin account on first startup:

- **Email**: `admin@beybolt.com`
- **Password**: `Admin@123`

⚠️ **IMPORTANT**: Change this password immediately after first login!

## Setting Up Google OAuth (Optional)

If you want to enable Google sign-in:

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:5001/api/auth/google/callback`
7. Copy the Client ID and Client Secret

### 2. Update Environment Variables

Add to your `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

### 3. Restart Containers

```bash
docker-compose down
docker-compose up --build
```

## File Upload System

The file upload system is automatically configured and ready to use:

- **Max file size**: 5MB (configurable via `MAX_FILE_SIZE`)
- **Allowed types**: JPEG, PNG, GIF, WebP
- **Storage**: Persistent Docker volume (`upload_data`)
- **Access**: Files served at `/uploads/tournaments/`

### Using File Uploads

Files can be uploaded via the tournament creation/edit forms in the frontend. The backend API endpoint is:

```
POST /api/tournaments/:id/upload
Content-Type: multipart/form-data
```

## Redis Caching

Redis is automatically configured for:

- **Session storage** (future feature)
- **Tournament data caching**
- **Leaderboard caching**
- **Performance optimization**

Redis runs in persistent mode with AOF (Append Only File) enabled for data durability.

## Docker Volumes

The setup uses three persistent volumes:

- `mongo_data` - MongoDB database files
- `redis_data` - Redis persistence files  
- `upload_data` - Uploaded tournament images

### Backing Up Data

```bash
# Backup MongoDB
docker-compose exec mongo mongodump --out=/data/backup

# Backup uploads
docker cp challonge-clone-backend-1:/app/uploads ./uploads-backup
```

## Troubleshooting

### Admin user not created

Check backend logs:
```bash
docker-compose logs backend
```

Look for: "✅ Admin user created successfully!"

### Cannot login with admin credentials

1. Stop containers: `docker-compose down`
2. Remove volumes: `docker volume rm challonge-clone_mongo_data`
3. Restart: `docker-compose up --build`

### Redis connection errors

Redis is optional. The app will continue to work without it, but with reduced performance. Check logs:
```bash
docker-compose logs redis
```

### File uploads not working

1. Check upload directory exists in container:
   ```bash
   docker-compose exec backend ls -la /app/uploads
   ```

2. Check environment variables:
   ```bash
   docker-compose exec backend env | grep UPLOAD
   ```

### Port conflicts

If ports 3000, 5001, 6379, or 27017 are already in use:

1. Edit `docker-compose.yml`
2. Change port mappings (e.g., `"3001:80"` instead of `"3000:80"`)
3. Update environment variables accordingly

## Development vs Production

### Development Mode

```bash
# Use docker-compose.dev.yml for development
docker-compose -f docker-compose.dev.yml up
```

Features:
- Hot reload for code changes
- Source code mounted as volumes
- Debug logging enabled

### Production Mode

```bash
docker-compose up -d
```

Features:
- Optimized builds
- No source code mounting
- Production-ready settings

## Stopping the Application

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (WARNING: deletes all data!)
docker-compose down -v
```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up --build
```

## Security Considerations

1. **JWT Secret**: Generate a strong random string for `JWT_SECRET`
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Admin Password**: Change immediately after first login

3. **CORS**: Update allowed origins in `backend/src/server.js` for production

4. **HTTPS**: Use a reverse proxy (nginx, Caddy) for SSL in production

5. **Environment Variables**: Never commit `.env` files to version control

## Next Steps

- [ ] Change admin password
- [ ] Configure Google OAuth (optional)
- [ ] Set up production domain and SSL
- [ ] Configure email service (future feature)
- [ ] Set up monitoring and logging
- [ ] Configure automated backups

## Support

For issues or questions:
- Check the main README.md
- Review Docker logs: `docker-compose logs`
- Check individual service logs: `docker-compose logs <service-name>`

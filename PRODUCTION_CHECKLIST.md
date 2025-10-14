# Production Deployment Checklist

Use this checklist before deploying to production.

## Security

### Environment Variables
- [ ] All secrets are in environment variables (not hardcoded)
- [ ] `.env` files are in `.gitignore`
- [ ] `JWT_SECRET` is strong (32+ random characters)
- [ ] `NODE_ENV` is set to `production`
- [ ] Database credentials are secure

### Authentication & Authorization
- [ ] Default admin password has been changed
- [ ] JWT expiry is appropriate for your use case
- [ ] Password hashing is working (bcrypt)
- [ ] Role-based access control is enforced
- [ ] API endpoints have proper auth middleware

### CORS & Network Security
- [ ] CORS is configured for production domains only
- [ ] Rate limiting is enabled and configured
- [ ] Helmet.js is enabled
- [ ] HTTPS/SSL is configured
- [ ] No sensitive data in logs

## Database

### MongoDB Setup
- [ ] Using MongoDB Atlas or secure hosted solution
- [ ] Database backups are configured
- [ ] Connection string is secure
- [ ] Database indexes are created (already in models)
- [ ] Connection pooling is configured

### Data Integrity
- [ ] Admin user has been seeded: `npm run seed`
- [ ] Test data has been cleared
- [ ] Data validation is working on backend
- [ ] Mongoose schemas are properly defined

## Backend

### Configuration
- [ ] `PORT` is set correctly
- [ ] `MONGODB_URI` points to production database
- [ ] `FRONTEND_URL` matches production frontend
- [ ] `BACKEND_URL` matches production backend
- [ ] All required env vars are set

### Performance
- [ ] Gzip compression is enabled
- [ ] Static file caching is configured
- [ ] Database queries are optimized
- [ ] No console.log in production code
- [ ] Error logging is set up (e.g., Sentry)

### Error Handling
- [ ] All routes have try-catch blocks
- [ ] Error middleware is configured
- [ ] Validation errors are handled gracefully
- [ ] 404 handler is in place
- [ ] Database errors are caught

## Frontend

### Configuration
- [ ] `REACT_APP_API_URL` points to production backend
- [ ] Build is optimized: `npm run build`
- [ ] Service worker is configured (if using PWA)
- [ ] Analytics are configured (optional)

### Performance
- [ ] Images are optimized
- [ ] Lazy loading is implemented where appropriate
- [ ] Bundle size is reasonable
- [ ] CDN is configured for static assets (optional)

### User Experience
- [ ] Loading states are implemented
- [ ] Error boundaries are in place
- [ ] Toast notifications work
- [ ] Forms have validation
- [ ] Mobile responsive design tested

## Testing

### Manual Testing
- [ ] User registration works
- [ ] User login works
- [ ] Tournament creation works
- [ ] Admin approval workflow works
- [ ] Bracket visualization displays correctly
- [ ] All navigation works
- [ ] Mobile layout works
- [ ] Error handling works

### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### API Testing
- [ ] All endpoints return correct status codes
- [ ] Authentication required endpoints reject unauthenticated requests
- [ ] Admin endpoints reject non-admin users
- [ ] Input validation works
- [ ] Error responses are consistent

## Monitoring & Logging

### Application Monitoring
- [ ] Health check endpoint is working
- [ ] Server monitoring is set up (PM2, New Relic, etc.)
- [ ] Error tracking is configured (Sentry, LogRocket, etc.)
- [ ] Uptime monitoring is configured (UptimeRobot, Pingdom, etc.)

### Logging
- [ ] Structured logging is implemented
- [ ] Log levels are appropriate
- [ ] Sensitive data is not logged
- [ ] Logs are persisted
- [ ] Log rotation is configured

## Infrastructure

### Server/Hosting
- [ ] Server has adequate resources (CPU, RAM, Disk)
- [ ] Auto-scaling is configured (if needed)
- [ ] Load balancer is configured (if needed)
- [ ] Firewall rules are set
- [ ] SSH access is secured

### DNS & Domain
- [ ] Domain is registered
- [ ] DNS records are configured
- [ ] SSL certificate is installed
- [ ] SSL renewal is automated (Let's Encrypt)
- [ ] www redirects are configured

### Deployment
- [ ] CI/CD pipeline is configured (optional but recommended)
- [ ] Deployment process is documented
- [ ] Rollback process is defined
- [ ] Zero-downtime deployment (optional)

## Documentation

- [ ] README is up to date
- [ ] API documentation exists
- [ ] Deployment guide is complete
- [ ] Environment variables are documented
- [ ] Architecture diagram exists (optional)

## Backup & Recovery

- [ ] Database backup strategy is defined
- [ ] Backups are automated
- [ ] Backup restoration is tested
- [ ] Disaster recovery plan exists
- [ ] Data retention policy is defined

## Legal & Compliance

- [ ] Privacy policy is published (if collecting user data)
- [ ] Terms of service are published
- [ ] GDPR compliance (if serving EU users)
- [ ] Cookie consent is implemented (if needed)
- [ ] Data protection measures are in place

## Performance Benchmarks

### Backend
- [ ] Average API response time < 200ms
- [ ] 95th percentile response time < 500ms
- [ ] Can handle expected concurrent users
- [ ] Database queries are efficient

### Frontend
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 90
- [ ] No console errors or warnings

## Post-Deployment

### Immediate (First Hour)
- [ ] Monitor error logs
- [ ] Check application health
- [ ] Test critical flows (login, tournament creation)
- [ ] Verify database connections
- [ ] Check SSL certificate

### First Day
- [ ] Monitor performance metrics
- [ ] Review error rates
- [ ] Check user feedback
- [ ] Monitor server resources
- [ ] Verify backups ran

### First Week
- [ ] Review analytics
- [ ] Check for performance issues
- [ ] Address user-reported bugs
- [ ] Monitor database growth
- [ ] Review security logs

## Quick Start Commands

### Deploy Backend
```bash
cd backend
git pull origin main
npm install --production
npm run seed  # First time only
pm2 restart challonge-backend
pm2 logs challonge-backend
```

### Deploy Frontend
```bash
cd frontend
git pull origin main
npm install
npm run build
# Copy build to web server
sudo cp -r build/* /var/www/html/
```

### Check Status
```bash
# Backend
pm2 status
pm2 logs challonge-backend --lines 50

# Database
mongo --eval "db.adminCommand('ping')"

# Frontend (nginx)
sudo systemctl status nginx
sudo nginx -t  # Test config
```

### Rollback
```bash
# Backend
cd backend
git checkout previous-commit-hash
npm install
pm2 restart challonge-backend

# Frontend
# Restore previous build from backup
sudo cp -r /var/www/html-backup/* /var/www/html/
```

## Emergency Contacts

List key contacts for production issues:

- **Infrastructure**: [Name/Service]
- **Database**: [MongoDB Atlas support]
- **Domain/DNS**: [Registrar support]
- **SSL**: [Certificate provider]
- **On-Call Developer**: [Your contact]

## Status Page

Consider creating a status page (e.g., status.yourdomain.com) to communicate:
- Current system status
- Scheduled maintenance
- Incident history
- Performance metrics

---

## Sign-Off

Before going live, this checklist should be reviewed by:

- [ ] **Developer**: All technical requirements met
- [ ] **QA/Tester**: All tests pass
- [ ] **Security**: Security audit complete
- [ ] **Operations**: Infrastructure ready
- [ ] **Product Owner**: Features meet requirements

**Date of Deployment**: _______________

**Deployed By**: _______________

**Production URL**: _______________

---

## Notes

Add any production-specific notes or configurations here:

```
[Your notes...]
```

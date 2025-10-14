# Testing Guide

This guide covers testing the tournament management platform functionality.

## Pre-Testing Setup

### 1. Start MongoDB
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or manually
mongod --config /usr/local/etc/mongod.conf

# Verify it's running
mongo --eval "db.version()"
```

### 2. Seed Database
```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin@challonge.local` / `admin123`
- Test user: `user@test.com` / `test123`

### 3. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## Test Scenarios

### 1. User Authentication

#### Test Case: User Registration
1. Navigate to http://localhost:3000/register
2. Fill in:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Display Name: `Test User`
3. Submit form
4. **Expected**: Redirected to dashboard with success message

#### Test Case: User Login
1. Navigate to http://localhost:3000/login
2. Enter credentials: `user@test.com` / `test123`
3. Submit form
4. **Expected**: Redirected to dashboard, user info displayed in navbar

#### Test Case: Invalid Login
1. Navigate to http://localhost:3000/login
2. Enter invalid credentials
3. **Expected**: Error message displayed, stays on login page

### 2. Tournament Creation

#### Test Case: Create Valid Tournament
1. Login as test user
2. Click "Create Tournament" in navbar
3. Fill in **required fields**:
   - Tournament name: `Summer Showdown 2024`
   - Game/Sport: `Valorant`
   - Format: `Single Elimination`
   - Max Participants: `16`
   - Registration Deadline: (future date)
   - Tournament Starts: (date after registration)
4. Submit form
5. **Expected**:
   - Success toast notification
   - Redirected to tournament detail page
   - Tournament status: `pending-approval` (for non-admin users)

#### Test Case: Validation Errors
1. Try to create tournament with:
   - Empty required fields
   - Start date before registration deadline
   - End date before start date
2. **Expected**:
   - Form validation errors displayed
   - Cannot submit until fixed

### 3. Admin Dashboard

#### Test Case: Admin Login & Access
1. Logout if logged in
2. Login with admin credentials: `admin@challonge.local` / `admin123`
3. Navigate to http://localhost:3000/admin
4. **Expected**:
   - Admin dashboard loads
   - Can see pending tournaments
   - Statistics displayed

#### Test Case: Approve Tournament
1. Login as admin
2. Navigate to admin dashboard
3. Click "Approve" on pending tournament
4. **Expected**:
   - Success message
   - Tournament removed from pending list
   - Tournament status changes to `open`

#### Test Case: Reject Tournament
1. Login as admin
2. Click "Reject" on pending tournament
3. **Expected**:
   - Success message
   - Tournament removed from pending list
   - Tournament status changes to `rejected`

### 4. Tournament List & Details

#### Test Case: View All Tournaments
1. Navigate to http://localhost:3000/tournaments
2. **Expected**:
   - List of approved/open tournaments displayed
   - Can filter by game, format, status
   - Pagination works

#### Test Case: View Tournament Details
1. Click on any tournament card
2. **Expected**:
   - Tournament details page loads
   - Shows organizer, participants, settings
   - Registration button (if user logged in and tournament is open)

#### Test Case: Register for Tournament
1. Login as test user
2. Navigate to open tournament
3. Click "Register now"
4. **Expected**:
   - Success message
   - Participant count increases
   - Button changes state

### 5. Bracket Visualization

#### Test Case: View Tournament Bracket
1. Create a tournament and approve it (as admin)
2. Add participants
3. Start the tournament (requires admin/organizer access)
4. **Expected**:
   - Bracket visualization displays
   - Rounds shown correctly
   - Matches organized properly

### 6. Error Handling

#### Test Case: API Connection Failure
1. Stop the backend server
2. Try to load tournaments page
3. **Expected**:
   - Error message displayed
   - Graceful failure, no crash

#### Test Case: Unauthorized Access
1. Logout
2. Try to access http://localhost:3000/admin
3. **Expected**:
   - Redirected to login page
   - OR access denied message

#### Test Case: Non-Admin Admin Access
1. Login as regular user (`user@test.com`)
2. Try to access http://localhost:3000/admin
3. **Expected**:
   - "Access Denied" message
   - Cannot view admin panel

## Manual Testing Checklist

### Authentication & Authorization
- [ ] User can register
- [ ] User can login
- [ ] User can logout
- [ ] Protected routes redirect to login
- [ ] Admin routes only accessible to admins
- [ ] JWT token persists across page refreshes
- [ ] Token expiry handled gracefully

### Tournament Management
- [ ] User can create tournament
- [ ] Form validation works correctly
- [ ] Admin can approve tournaments
- [ ] Admin can reject tournaments
- [ ] Tournament status updates correctly
- [ ] Tournament list filters work
- [ ] Tournament detail page loads correctly

### Bracket & Matches
- [ ] Bracket displays correctly
- [ ] Match details modal opens
- [ ] Match scores can be updated (if authorized)
- [ ] Winner selection works
- [ ] Bracket updates after match completion

### UI/UX
- [ ] Loading states show appropriately
- [ ] Toast notifications appear
- [ ] Forms show validation errors inline
- [ ] Mobile responsive design works
- [ ] Navigation works correctly
- [ ] No console errors in browser

## API Testing with cURL

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "Test123!",
    "displayName": "API Test User"
  }'
```

### Test User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "test123"
  }'
```

### Test Create Tournament (with token)
```bash
# First get token from login, then:
curl -X POST http://localhost:5000/api/tournaments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "API Test Tournament",
    "game": "Chess",
    "format": "single-elimination",
    "maxParticipants": 8,
    "startDate": "2024-12-01T10:00:00Z",
    "registrationDeadline": "2024-11-25T23:59:59Z"
  }'
```

### Test Get Tournaments
```bash
curl http://localhost:5000/api/tournaments
```

## Automated Testing (Future)

### Unit Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
cd backend
npm run test:integration
```

### E2E Tests (Cypress - future)
```bash
cd frontend
npm run test:e2e
```

## Performance Testing

### Load Testing (Artillery - future)
```bash
npm install -g artillery
artillery quick --count 10 --num 50 http://localhost:5000/api/tournaments
```

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution**:
```bash
brew services restart mongodb-community
```

### Issue: Port Already in Use
**Solution**:
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Issue: Cannot Create Tournament
**Check**:
1. MongoDB is running
2. Backend server is running
3. Frontend .env has correct API URL
4. User is authenticated
5. Check browser console for errors
6. Check backend logs for errors

### Issue: Admin Dashboard Empty
**Check**:
1. Logged in as admin user
2. Tournaments exist with `pending-approval` status
3. Backend admin routes are working

## Browser DevTools Tips

### Check API Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Watch API calls as you interact

### Check Redux State
1. Install Redux DevTools extension
2. Open DevTools
3. Click Redux tab
4. Inspect state and actions

### Check Console Errors
1. Open DevTools Console tab
2. Look for red error messages
3. Expand stack traces for debugging

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser console logs
5. Backend server logs
6. Screenshots if applicable
7. Environment (OS, Node version, MongoDB version)

---

## Success Criteria

Your application is working correctly if:
- ✅ Users can register and login
- ✅ Users can create tournaments
- ✅ Admin can approve/reject tournaments
- ✅ Tournaments display correctly
- ✅ Bracket visualization works
- ✅ No console errors
- ✅ All API calls succeed
- ✅ Data persists in MongoDB
- ✅ Protected routes work correctly
- ✅ Error handling is graceful

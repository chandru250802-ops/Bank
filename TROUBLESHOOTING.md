# 🔧 Bank Management System - Troubleshooting Guide

## Common Issues & Solutions

---

## ❌ PostgreSQL Issues

### Issue 1: "psql: could not connect to server"

**Cause:** PostgreSQL service is not running

**Solutions:**

**Windows:**
```powershell
# Check if running
Get-Service PostgreSQL13  # or your version

# Start the service
Start-Service -Name PostgreSQL13

# Or use Services.msc
# Services → PostgreSQL → Right-click → Start
```

**Linux:**
```bash
# Check status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Enable auto-start
sudo systemctl enable postgresql
```

**macOS:**
```bash
# Start PostgreSQL
brew services start postgresql

# Check if running
brew services list
```

---

### Issue 2: "FATAL: password authentication failed"

**Cause:** Wrong password or incorrect user

**Solution:**
```bash
# Reset PostgreSQL password
# Windows: Use pgAdmin GUI or:
psql -U postgres -h 127.0.0.1

# You'll be prompted for password
# Default is usually 'postgres' on fresh install
```

**Check what you entered during installation and use that password.**

---

### Issue 3: "CREATE DATABASE failed: permission denied"

**Cause:** User doesn't have permission to create database

**Solution:**
```bash
# Use superuser account
psql -U postgres -c "CREATE DATABASE bank_management;"

# Or grant permissions to your user
psql -U postgres -c "ALTER USER youruser CREATEDB;"
```

---

### Issue 4: "database does not exist"

**Cause:** Schema file wasn't executed properly

**Solution:**
```bash
# Create database fresh
psql -U postgres -c "DROP DATABASE bank_management;"
psql -U postgres -c "CREATE DATABASE bank_management;"

# Apply schema carefully
psql -U postgres -d bank_management -f sql/schema.sql

# Verify tables exist
psql -U postgres -d bank_management -c "\dt"
```

---

## ❌ C++ Compilation Issues

### Issue 5: "cannot find -lpqxx"

**Cause:** libpqxx library not installed

**Solutions:**

**Windows (vcpkg):**
```powershell
# Make sure vcpkg is set up
cd C:\vcpkg  # or wherever you installed it

# Install libpqxx
.\vcpkg install libpqxx:x64-windows

# Update CMakeLists.txt to find it:
# cmake .. -DCMAKE_TOOLCHAIN_FILE="C:/vcpkg/scripts/buildsystems/vcpkg.cmake"
```

**Ubuntu/Debian:**
```bash
sudo apt-get install libpqxx-dev libpq-dev
```

**macOS:**
```bash
brew install libpqxx
```

---

### Issue 6: "crow/crow_all.h not found"

**Cause:** Crow framework not installed

**Solution:**
```bash
# Clone and install Crow
git clone https://github.com/CrowCpp/Crow.git
cd Crow
mkdir build && cd build
cmake ..
cmake --build .
sudo cmake --install .  # Windows: cmake --install . (no sudo)

# Then rebuild your project:
cd ../../server/build
cmake ..
cmake --build . --config Release
```

---

### Issue 7: "nlohmann/json.hpp not found"

**Cause:** nlohmann-json library not installed

**Solutions:**

**Ubuntu/Debian:**
```bash
sudo apt-get install nlohmann-json3-dev
```

**macOS:**
```bash
brew install nlohmann-json
```

**Windows (vcpkg):**
```powershell
.\vcpkg install nlohmann-json:x64-windows
```

**Or download header-only version:**
```bash
git clone https://github.com/nlohmann/json.git
# Copy json/include/nlohmann to your project
```

---

### Issue 8: "CMake Error: No C++ compiler"

**Cause:** C++ compiler not installed

**Solutions:**

**Windows:**
```powershell
# Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/
# Select "Desktop development with C++"
```

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential cmake
```

**macOS:**
```bash
# Install Xcode command-line tools
xcode-select --install

# Or install full Xcode from App Store
```

---

### Issue 9: "Build failed with 500 errors"

**Solution:** Clean and rebuild

```bash
cd server/build
rm -rf *  # Remove all build files (or use GUI to delete)
cmake ..
cmake --build . --config Release
```

---

## ❌ Server Runtime Issues

### Issue 10: "Address already in use" (Port 8080 taken)

**Cause:** Something else is using port 8080

**Solutions:**

**Find what's using the port:**

**Windows:**
```powershell
netstat -ano | findstr :8080
# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Linux:**
```bash
lsof -i :8080
kill -9 <PID>
```

**macOS:**
```bash
lsof -i :8080
kill -9 <PID>
```

**Or change port in main.cpp:**
```cpp
// Line ~400 in main.cpp, change from:
app.port(8080).run();

// To:
app.port(8081).run();
```

---

### Issue 11: "Server crashes on startup"

**Cause:** Database connection failed

**Solution:**
1. Check PostgreSQL is running
2. Check credentials in `main.cpp` line 14:
```cpp
// Make sure this matches your setup
g_db = new Database("dbname=bank_management user=postgres password=root host=127.0.0.1");
```

3. Verify database exists:
```bash
psql -U postgres -l | grep bank_management
```

---

### Issue 12: "Server runs but frontend can't connect"

**Cause:** Firewall blocking, or wrong URL

**Solutions:**
```javascript
// Check in script.js that API_BASE_URL is correct:
const API_BASE_URL = 'http://127.0.0.1:8080';

// If server is on different machine:
const API_BASE_URL = 'http://SERVER_IP:8080';
```

**Firewall:**
```powershell
# Windows: Allow port 8080 through firewall
netsh advfirewall firewall add rule name="Allow 8080" dir=in action=allow protocol=tcp localport=8080
```

---

## ❌ Frontend Issues

### Issue 13: "404 Not Found when opening index.html"

**Cause:** Not serving files from correct directory

**Solution:**
```bash
# Make sure you're in the public directory
cd Bank/public

# Then start server
python -m http.server 8000

# Should show "Serving HTTP on 0.0.0.0 port 8000"
```

---

### Issue 14: "CORS error in browser console"

**Cause:** Normal in development with separate frontend/backend

**Solution for development:**
- It's expected behavior
- Browser blocks cross-origin requests for security
- Works fine because frontend and backend are designed to communicate this way

**For production:**
- Set up proper domain configuration
- Or serve both from same server

---

### Issue 15: "Login button doesn't work"

**Cause:** Backend not responding

**Troubleshooting:**
```javascript
// Open browser console (F12)
// Check Network tab when clicking Login
// Should see POST request to http://127.0.0.1:8080/api/login

// Common issues:
// 1. Backend server not running
// 2. Wrong URL in script.js (API_BASE_URL)
// 3. Port 8080 not accessible
```

---

### Issue 16: "Session expires immediately"

**Cause:** Server-side session lost (normal behavior)

**Explanation:**
- Sessions are stored in server memory
- If server restarts, sessions are lost
- Users will need to login again

**This is expected.** For persistent sessions, you'd need Redis or database session store.

---

## ❌ Database Issues

### Issue 17: "Cannot insert duplicate key value violates unique constraint"

**Cause:** Username already exists

**Solution:**
- Use different username
- Or delete user from database:
```bash
psql -U postgres -d bank_management -c "DELETE FROM users WHERE username='testuser';"
```

---

### Issue 18: "Transaction amount incorrect"

**Cause:** Floating-point calculation errors (rare)

**Prevention:**
- Database uses DECIMAL(15,2) - correct for money
- Calculations done on server side
- JavaScript display uses `.toFixed(2)`

---

### Issue 19: "No transactions showing in history"

**Cause:** No deposits/withdrawals made yet, or session expired

**Solution:**
- Make a deposit or withdrawal
- Then click "Refresh History"
- Check that you're logged in (nav bar shows username)

---

## ❌ Other Issues

### Issue 20: "Password not working after registration"

**Cause:** Browser cached wrong data or password mismatch

**Solution:**
```javascript
// Clear browser storage
// Open Console (F12) and run:
localStorage.clear();
location.reload();

// Then try logging in again
```

---

### Issue 21: "System says balance is wrong"

**Cause:** Browser cached old balance

**Solution:**
- Click "Refresh" button on balance card
- Or reload entire page (F5)
- Check database directly:

```bash
psql -U postgres -d bank_management -c "SELECT * FROM users;"
```

---

### Issue 22: "Cannot save environment variables"

**Solution:** Not needed for this project
- Edit connection string directly in code if needed
- `.env.example` is just for reference
- Update `main.cpp` line 14 with your credentials

---

## ✅ Testing Checklist

Run through this checklist to verify everything works:

```
[ ] PostgreSQL service running
[ ] Database exists (psql -l shows bank_management)
[ ] Tables exist (psql -d bank_management -c "\dt")
[ ] C++ server builds without errors
[ ] C++ server starts on port 8080
[ ] Frontend loads on http://127.0.0.1:8000
[ ] Can register new account
[ ] Can login with new account
[ ] Can see balance (should be $0.00)
[ ] Can deposit $100
[ ] Balance updates to $100
[ ] Transaction history shows deposit
[ ] Can withdraw $50
[ ] Balance updates to $50
[ ] Transaction history shows both transactions
[ ] Can logout
[ ] Cannot access dashboard after logout
[ ] Database has correct transactions recorded
```

---

## 🆘 Still Having Issues?

### Debug Steps

1. **Check logs/console output:**
   - Server console for error messages
   - Browser console (F12) for JavaScript errors
   - PostgreSQL logs

2. **Verify all services:**
```bash
# Is PostgreSQL running?
psql -U postgres -c "SELECT 1"

# Is C++ server running?
curl http://127.0.0.1:8080/

# Can you reach frontend?
curl http://127.0.0.1:8000/index.html
```

3. **Check connectivity:**
```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :8000

# Linux/macOS
lsof -i :8080
lsof -i :8000
```

4. **Restart everything in order:**
   1. Stop C++ server
   2. Stop frontend server
   3. Restart PostgreSQL
   4. Restart C++ server
   5. Restart frontend server
   6. Try again

---

## 📞 Getting Help

If you're still stuck:

1. **Check README.md** for setup instructions
2. **Check QUICKSTART.md** for quick reference
3. **Read error messages carefully** - they often tell you the issue
4. **Google the exact error message** - usually helps
5. **Check Crow docs**: https://github.com/CrowCpp/Crow
6. **Check PostgreSQL docs**: https://www.postgresql.org/docs

---

**Remember: Most issues are permission or path related. Double-check your installation paths and PostgreSQL credentials!**

# Quick Start Guide for Bank Management System

## ⚡ 5-Minute Quick Start

### Prerequisites
- PostgreSQL installed and running
- C++ compiler (g++, clang, or MSVC)
- CMake installed
- Python 3 (for serving frontend)

### Step 1: Setup Database (2 minutes)

**Windows (PowerShell as Admin):**
```powershell
# Start PostgreSQL service
Start-Service -Name PostgreSQL13  # or your PostgreSQL version

# Create database
psql -U postgres -c "CREATE DATABASE bank_management;"

# Apply schema
psql -U postgres -d bank_management -f sql\schema.sql
```

**Linux/macOS:**
```bash
# Start PostgreSQL (already running usually)
sudo systemctl start postgresql  # Linux only

# Create and setup database
sudo -u postgres createdb bank_management
sudo -u postgres psql -d bank_management -f sql/schema.sql
```

### Step 2: Build C++ Server (1-2 minutes)

```bash
cd server
mkdir build
cd build
cmake ..
cmake --build . --config Release
```

### Step 3: Start the Application

**Terminal 1 - Start Backend Server:**
```bash
cd server/build
./BankServer          # Linux/macOS
Release\BankServer    # Windows
```

Expected output:
```
🚀 Bank Management System Server starting...
📍 Server running on http://127.0.0.1:8080
```

**Terminal 2 - Serve Frontend:**
```bash
cd public
python -m http.server 8000

# or if you have Python 2
python -m SimpleHTTPServer 8000
```

### Step 4: Access the Application

Open your browser and go to:
```
http://127.0.0.1:8000
```

## 🧪 Test It

1. **Register**: Create an account with username `demo` and password `demo123`
2. **Login**: Login with your credentials
3. **Deposit**: Add $1000 to your account
4. **Withdraw**: Take out $300
5. **Check History**: See your transactions

---

## 🔧 Troubleshooting

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# If not running:
# Windows: Services.msc -> PostgreSQL -> Start
# Linux: sudo systemctl start postgresql
# macOS: brew services start postgresql
```

### "Port 8080 already in use"
Edit `main.cpp` line with `app.port(8080)` and change to another port like `8081`

### "Cannot find pqxx/pqxx.h"
You need to install libpqxx:
```bash
# Ubuntu/Debian
sudo apt-get install libpqxx-dev

# macOS
brew install libpqxx

# Windows: Use vcpkg
vcpkg install libpqxx
```

### "Crow not found"
```bash
git clone https://github.com/CrowCpp/Crow.git
cd Crow && mkdir build && cd build
cmake .. && cmake --build . && sudo cmake --install .
```

---

## 📝 Important Files to Edit

If your database credentials differ from the defaults:

**Edit `server/main.cpp` line ~14:**
```cpp
// Change from:
g_db = new Database("dbname=bank_management user=postgres password=root host=127.0.0.1");

// To match your PostgreSQL password
g_db = new Database("dbname=bank_management user=postgres password=YOUR_PASSWORD host=127.0.0.1");
```

---

## 🌐 Accessing from Other Computers

To access the app from another machine on your network:

1. Find your computer's IP:
   ```bash
   # Windows
   ipconfig | findstr "IPv4"
   
   # Linux/macOS
   ifconfig | grep inet
   ```

2. Access from other machine:
   ```
   http://YOUR_IP:8000
   ```

Note: Both frontend and backend must be accessible from that IP.

---

## 📚 API Examples

### Register
```bash
curl -X POST http://127.0.0.1:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"secret123"}'
```

### Login
```bash
curl -X POST http://127.0.0.1:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"secret123"}'
```

### Deposit (replace SESSION_TOKEN with actual token)
```bash
curl -X POST http://127.0.0.1:8080/api/deposit \
  -H "Content-Type: application/json" \
  -d '{"session_token":"SESSION_TOKEN","amount":100}'
```

---

## 🎓 Learning Path

1. **Understand the code**
   - Read `README.md` for complete overview
   - Check `server/main.cpp` for API endpoints
   - Review `public/script.js` for frontend logic

2. **Modify and extend**
   - Add new features (transfer, loans, etc.)
   - Implement proper hashing (bcrypt instead of simple XOR)
   - Add email notifications
   - Create admin dashboard

3. **Deploy to production**
   - Set up SSL/HTTPS
   - Use proper session store (Redis)
   - Implement rate limiting
   - Add comprehensive logging

---

## ✅ Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `bank_management` created
- [ ] Schema applied successfully
- [ ] C++ dependencies installed (Crow, libpqxx, nlohmann-json)
- [ ] C++ server builds successfully
- [ ] Backend running on port 8080
- [ ] Frontend served on port 8000
- [ ] Can open http://127.0.0.1:8000 in browser
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Can deposit and withdraw
- [ ] Can see transaction history

---

**You're all set! 🚀**

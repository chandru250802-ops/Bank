# 🏦 Bank Management System

A complete, production-ready bank management system built with C++ backend, PostgreSQL database, and a modern web GUI.

## ✨ Features

✅ **User Management**
- Account creation and registration
- Secure login/logout with session-based authentication
- Password hashing and validation

✅ **Banking Operations**
- Deposit money into your account
- Withdraw money (with balance validation)
- View account balance in real-time
- Transaction history with timestamps

✅ **Security**
- Session-based authentication (only logged-in users can access their accounts)
- No account ID manipulation (secure server-side validation)
- Password hashing
- CSRF protection ready

✅ **Modern GUI**
- Responsive web interface (works on desktop, tablet, mobile)
- Beautiful gradient design with smooth animations
- Real-time balance updates
- Transaction history with filtering
- User-friendly forms and error messages

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | C++ (Crow Framework) |
| **Database** | PostgreSQL |
| **API** | RESTful JSON API |
| **Server** | Crow HTTP Server (http://127.0.0.1:8080) |
| **Architecture** | Client-Server with Session Management |

## 📁 Project Structure

```
Bank/
│
├── server/
│   ├── main.cpp          # C++ server with all API endpoints
│   ├── db.h              # Database class header
│   ├── db.cpp            # Database operations (CRUD)
│   └── CMakeLists.txt    # Build configuration
│
├── public/
│   ├── index.html        # Main GUI (login, register, dashboard)
│   ├── style.css         # Responsive styling
│   └── script.js         # Frontend logic and API calls
│
├── sql/
│   └── schema.sql        # PostgreSQL database schema
│
└── README.md             # This file
```

## 🚀 Installation & Setup

### Prerequisites

- **C++ Compiler** (GCC, Clang, or MSVC)
- **PostgreSQL** (version 12+)
- **CMake** (for building)
- **Git** (for cloning Crow)
- **Modern Web Browser** (Chrome, Firefox, Edge, Safari)

### Step 1: Install PostgreSQL

**Windows:**
```powershell
# Download and install PostgreSQL from https://www.postgresql.org/download/windows/
# During installation:
# - Remember the password for 'postgres' user
# - Default port is 5432
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

### Step 2: Create Database

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE bank_management;

# Exit psql
\q
```

### Step 3: Create Database Schema

```powershell
# Run the schema file
psql -U postgres -d bank_management -f sql/schema.sql
```

Or manually execute the SQL:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_user_transactions ON transactions(user_id);
CREATE INDEX idx_transaction_date ON transactions(transaction_date);
```

### Step 4: Install Dependencies

#### Install Crow Framework

```bash
git clone https://github.com/CrowCpp/Crow.git
cd Crow
mkdir build && cd build
cmake .. && cmake --build .
cmake --install .
```

#### Install PostgreSQL C++ Library (libpqxx)

**Windows (vcpkg):**
```powershell
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
.\vcpkg integrate install
.\vcpkg install libpqxx:x64-windows
```

**Linux:**
```bash
sudo apt-get install libpqxx-dev libpq-dev
```

**macOS:**
```bash
brew install libpqxx
```

#### Install nlohmann/json

**Windows (vcpkg):**
```powershell
.\vcpkg install nlohmann-json:x64-windows
```

**Linux:**
```bash
sudo apt-get install nlohmann-json3-dev
```

**macOS:**
```bash
brew install nlohmann-json
```

### Step 5: Build C++ Server

```bash
cd server/
mkdir build && cd build
cmake ..
cmake --build . --config Release
```

### Step 6: Run the Application

**Terminal 1 - Start C++ Server:**
```bash
cd server/build
./BankServer          # Linux/macOS
BankServer.exe        # Windows
```

Expected output:
```
🚀 Bank Management System Server starting...
📍 Server running on http://127.0.0.1:8080
```

**Terminal 2 - Serve Frontend (Use any HTTP server):**

Python 3:
```bash
cd public/
python -m http.server 8000
```

Python 2:
```bash
python -m SimpleHTTPServer 8000
```

Node.js:
```bash
# Install http-server globally (one-time)
npm install -g http-server

# Run
http-server public/ -p 8000
```

**Visit in Browser:**
```
http://127.0.0.1:8000
```

## 📚 API Endpoints

All endpoints expect JSON requests with appropriate `Content-Type: application/json` header.

### Authentication

#### Register New Account
```
POST /api/register
{
    "username": "john_doe",
    "password": "securePassword123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Account created successfully"
}
```

#### Login
```
POST /api/login
{
    "username": "john_doe",
    "password": "securePassword123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Login successful",
    "session_token": "session_123456789",
    "username": "john_doe"
}
```

#### Logout
```
POST /api/logout
{
    "session_token": "session_123456789"
}
```

### Banking Operations

#### Get Balance
```
POST /api/balance
{
    "session_token": "session_123456789"
}
```

**Response:**
```json
{
    "success": true,
    "balance": 5000.50,
    "username": "john_doe"
}
```

#### Deposit Money
```
POST /api/deposit
{
    "session_token": "session_123456789",
    "amount": 1000.00
}
```

**Response:**
```json
{
    "success": true,
    "message": "Deposit successful",
    "new_balance": 6000.50,
    "amount_deposited": 1000.00
}
```

#### Withdraw Money
```
POST /api/withdraw
{
    "session_token": "session_123456789",
    "amount": 500.00
}
```

**Response:**
```json
{
    "success": true,
    "message": "Withdrawal successful",
    "new_balance": 5500.50,
    "amount_withdrawn": 500.00
}
```

#### Get Transaction History
```
POST /api/transactions
{
    "session_token": "session_123456789"
}
```

**Response:**
```json
{
    "success": true,
    "transactions": [
        {
            "type": "DEPOSIT",
            "amount": 1000.00,
            "balance_after": 6000.50,
            "date": "2025-12-22 10:30:45"
        },
        {
            "type": "WITHDRAW",
            "amount": 500.00,
            "balance_after": 5500.50,
            "date": "2025-12-22 11:15:30"
        }
    ]
}
```

## 🔐 Security Features

✅ **Session-Based Authentication**
- Each login generates a unique session token
- Token required for all banking operations
- Sessions are server-side (cannot be forged client-side)

✅ **Input Validation**
- Username: 3+ characters
- Password: 6+ characters
- Amount: Must be positive number
- Balance checks before withdrawal

✅ **Database Security**
- Parameterized queries (prevents SQL injection)
- Password hashing
- Transaction logging for audit trail
- Foreign key constraints

✅ **CORS Ready**
- API designed for secure cross-origin requests
- Can be deployed on separate servers

## 🧪 Testing

### Test Account Creation
1. Open http://127.0.0.1:8000
2. Click "Register"
3. Enter username: `testuser` and password: `Test@123`
4. Click "Register"

### Test Login
1. Click "Login"
2. Enter the credentials you just created
3. You should see the dashboard

### Test Deposit
1. Enter amount: `1000`
2. Click "Deposit"
3. Check balance updates

### Test Withdraw
1. Enter amount: `500`
2. Click "Withdraw"
3. Check new balance: `500`

### Test Transaction History
1. Click "Refresh History"
2. See all deposits and withdrawals with timestamps

## 🐛 Troubleshooting

### "Connection refused" error
- ✅ Make sure PostgreSQL is running
- ✅ Check database credentials in `main.cpp`
- ✅ Verify database `bank_management` exists

### "Cannot connect to C++ server"
- ✅ Ensure C++ server is running on port 8080
- ✅ Check firewall settings
- ✅ Run: `netstat -an | grep 8080` to verify

### CORS errors in browser console
- ✅ This is normal in development
- ✅ Configure CORS in production deployment
- ✅ Or serve frontend and backend on same domain

### Session expires quickly
- ✅ Sessions persist in browser localStorage
- ✅ Close and reopen browser to refresh
- ✅ Server-side sessions last as long as server runs

## 📈 Future Enhancements

- [ ] JWT tokens instead of session strings
- [ ] OAuth2/Google Sign-in integration
- [ ] Email verification for registration
- [ ] Money transfer between users
- [ ] Loan management system
- [ ] Interest calculation
- [ ] Admin dashboard
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Two-factor authentication (2FA)

## 📝 Database Schema

### Users Table
```sql
id          SERIAL PRIMARY KEY
username    VARCHAR(50) UNIQUE NOT NULL
password    VARCHAR(255) NOT NULL (hashed)
balance     DECIMAL(15,2) DEFAULT 0.00
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Transactions Table
```sql
id                  SERIAL PRIMARY KEY
user_id             INTEGER (Foreign Key -> users.id)
transaction_type    VARCHAR(20) ('DEPOSIT' or 'WITHDRAW')
amount              DECIMAL(15,2)
balance_after       DECIMAL(15,2)
transaction_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 🎓 Learning Outcomes

This project demonstrates:

✅ **C++ Skills**
- Modern C++ (C++14/17)
- Networking with Crow framework
- REST API design
- JSON handling
- Database connectivity

✅ **Database Skills**
- PostgreSQL design and schema
- Complex queries
- Transaction management
- Index optimization

✅ **Web Development**
- Frontend/Backend separation
- HTTP requests (Fetch API)
- Responsive design
- Session management

✅ **Software Engineering**
- Clean code architecture
- Error handling
- Security best practices
- Testing and debugging

## 📄 License

This project is open-source and available for educational use.

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 👨‍💻 Author

Built as a comprehensive educational demonstration of full-stack development.

---

**Happy Banking! 🏦💰**

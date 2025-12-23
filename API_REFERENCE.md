# 🔌 API Reference Guide

Complete API documentation for the Bank Management System

---

## Base URL

```
http://127.0.0.1:8080
```

All requests must include header:
```
Content-Type: application/json
```

---

## 📚 API Endpoints

## 1️⃣ Register New Account

### Endpoint
```
POST /api/register
```

### Request Body
```json
{
    "username": "john_doe",
    "password": "securePassword123"
}
```

### Validation Rules
- Username: 3+ characters, alphanumeric + underscore
- Password: 6+ characters
- Username must be unique

### cURL Example
```bash
curl -X POST http://127.0.0.1:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"secure123"}'
```

### Success Response (201)
```json
{
    "success": true,
    "message": "Account created successfully"
}
```

### Error Responses
```json
// Username too short
{
    "success": false,
    "message": "Username must be 3+ chars, password 6+ chars"
}

// Username already exists
{
    "success": false,
    "message": "Username already exists"
}

// Server error
{
    "success": false,
    "message": "Error creating account"
}
```

---

## 2️⃣ Login

### Endpoint
```
POST /api/login
```

### Request Body
```json
{
    "username": "john_doe",
    "password": "securePassword123"
}
```

### cURL Example
```bash
curl -X POST http://127.0.0.1:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"secure123"}'
```

### Success Response (200)
```json
{
    "success": true,
    "message": "Login successful",
    "session_token": "session_1234567890_1671706234",
    "username": "john_doe"
}
```

### Error Response (401)
```json
{
    "success": false,
    "message": "Invalid username or password"
}
```

### Usage
Save the `session_token` and include it in all subsequent requests.

---

## 3️⃣ Logout

### Endpoint
```
POST /api/logout
```

### Request Body
```json
{
    "session_token": "session_1234567890_1671706234"
}
```

### cURL Example
```bash
curl -X POST http://127.0.0.1:8080/api/logout \
  -H "Content-Type: application/json" \
  -d '{"session_token":"session_1234567890_1671706234"}'
```

### Success Response (200)
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

---

## 4️⃣ Get Account Balance

### Endpoint
```
POST /api/balance
```

### Request Body
```json
{
    "session_token": "session_1234567890_1671706234"
}
```

### cURL Example
```bash
curl -X POST http://127.0.0.1:8080/api/balance \
  -H "Content-Type: application/json" \
  -d '{"session_token":"session_1234567890_1671706234"}'
```

### Success Response (200)
```json
{
    "success": true,
    "balance": 5000.50,
    "username": "john_doe"
}
```

### Error Response (401)
```json
{
    "success": false,
    "message": "Unauthorized - invalid session"
}
```

---

## 5️⃣ Deposit Money

### Endpoint
```
POST /api/deposit
```

### Request Body
```json
{
    "session_token": "session_1234567890_1671706234",
    "amount": 1000.00
}
```

### Validation Rules
- Amount must be > 0
- Amount must be a valid number
- Maximum amount: 1,000,000

### cURL Example
```bash
curl -X POST http://127.0.0.1:8080/api/deposit \
  -H "Content-Type: application/json" \
  -d '{"session_token":"session_1234567890_1671706234","amount":1000.00}'
```

### Success Response (200)
```json
{
    "success": true,
    "message": "Deposit successful",
    "new_balance": 6000.50,
    "amount_deposited": 1000.00
}
```

### Error Responses
```json
// Invalid amount
{
    "success": false,
    "message": "Amount must be greater than 0"
}

// Unauthorized
{
    "success": false,
    "message": "Unauthorized - invalid session"
}

// Server error
{
    "success": false,
    "message": "Error processing deposit"
}
```

---

## 6️⃣ Withdraw Money

### Endpoint
```
POST /api/withdraw
```

### Request Body
```json
{
    "session_token": "session_1234567890_1671706234",
    "amount": 500.00
}
```

### Validation Rules
- Amount must be > 0
- Amount must not exceed balance
- Amount must be a valid number

### cURL Example
```bash
curl -X POST http://127.0.0.1:8080/api/withdraw \
  -H "Content-Type: application/json" \
  -d '{"session_token":"session_1234567890_1671706234","amount":500.00}'
```

### Success Response (200)
```json
{
    "success": true,
    "message": "Withdrawal successful",
    "new_balance": 5500.50,
    "amount_withdrawn": 500.00
}
```

### Error Responses
```json
// Insufficient balance
{
    "success": false,
    "message": "Insufficient balance",
    "current_balance": 5000.50
}

// Invalid amount
{
    "success": false,
    "message": "Amount must be greater than 0"
}

// Unauthorized
{
    "success": false,
    "message": "Unauthorized - invalid session"
}
```

---

## 7️⃣ Get Transaction History

### Endpoint
```
POST /api/transactions
```

### Request Body
```json
{
    "session_token": "session_1234567890_1671706234"
}
```

### Query Parameters
- `limit`: Maximum transactions to return (default: 50)
- `offset`: Skip first N transactions (for pagination)

### cURL Example
```bash
curl -X POST http://127.0.0.1:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"session_token":"session_1234567890_1671706234"}'
```

### Success Response (200)
```json
{
    "success": true,
    "transactions": [
        {
            "type": "DEPOSIT",
            "amount": 1000.00,
            "balance_after": 6000.50,
            "date": "2025-12-22 14:30:45"
        },
        {
            "type": "WITHDRAW",
            "amount": 500.00,
            "balance_after": 5500.50,
            "date": "2025-12-22 14:45:20"
        },
        {
            "type": "DEPOSIT",
            "amount": 250.00,
            "balance_after": 5750.50,
            "date": "2025-12-22 15:00:10"
        }
    ]
}
```

### Error Response (401)
```json
{
    "success": false,
    "message": "Unauthorized - invalid session"
}
```

---

## 🔄 API Flow Diagram

```
1. User Opens App
   ↓
2. Click Register → POST /api/register
   ↓
   Account Created
   ↓
3. Click Login → POST /api/login
   ↓
   Receive session_token
   ↓
4. View Balance → POST /api/balance (with session_token)
   ↓
5. Deposit → POST /api/deposit (with session_token)
   ↓
6. Withdraw → POST /api/withdraw (with session_token)
   ↓
7. View History → POST /api/transactions (with session_token)
   ↓
8. Logout → POST /api/logout (with session_token)
```

---

## 🛡️ Security Headers

All responses include secure headers:

```
Content-Type: application/json
Cache-Control: no-store
X-Content-Type-Options: nosniff
```

---

## ⚡ Rate Limiting (Recommended for Production)

Currently unlimited. For production, implement:

```
- 100 requests/minute per IP
- 10 login attempts/minute per username
- 1000 transactions/day per user
```

---

## 📊 Response Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 201 | Created | New account created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Invalid session |
| 409 | Conflict | Username exists |
| 500 | Server Error | Server-side error |

---

## 🧪 Testing with Postman

### Collection Setup

1. Create new Collection: "Bank API"
2. Add environment variable:
   ```
   session_token: [will be set after login]
   api_url: http://127.0.0.1:8080
   ```

### Test Requests

**1. Register**
```
POST {{api_url}}/api/register
Body (raw JSON):
{
    "username": "postman_user",
    "password": "test12345"
}
```

**2. Login**
```
POST {{api_url}}/api/login
Body (raw JSON):
{
    "username": "postman_user",
    "password": "test12345"
}

Tests (JavaScript):
var jsonData = pm.response.json();
pm.environment.set("session_token", jsonData.session_token);
```

**3. Get Balance**
```
POST {{api_url}}/api/balance
Body (raw JSON):
{
    "session_token": "{{session_token}}"
}
```

**4. Deposit**
```
POST {{api_url}}/api/deposit
Body (raw JSON):
{
    "session_token": "{{session_token}}",
    "amount": 5000.00
}
```

**5. Withdraw**
```
POST {{api_url}}/api/withdraw
Body (raw JSON):
{
    "session_token": "{{session_token}}",
    "amount": 1000.00
}
```

**6. Transaction History**
```
POST {{api_url}}/api/transactions
Body (raw JSON):
{
    "session_token": "{{session_token}}"
}
```

**7. Logout**
```
POST {{api_url}}/api/logout
Body (raw JSON):
{
    "session_token": "{{session_token}}"
}
```

---

## 🔧 Testing with JavaScript

```javascript
// Configuration
const API_BASE_URL = 'http://127.0.0.1:8080';
let sessionToken = null;

// Register
async function register(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
    });
    return await response.json();
}

// Login
async function login(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
    });
    const data = await response.json();
    if (data.success) {
        sessionToken = data.session_token;
    }
    return data;
}

// Get Balance
async function getBalance() {
    const response = await fetch(`${API_BASE_URL}/api/balance`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({session_token: sessionToken})
    });
    return await response.json();
}

// Deposit
async function deposit(amount) {
    const response = await fetch(`${API_BASE_URL}/api/deposit`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({session_token: sessionToken, amount})
    });
    return await response.json();
}

// Withdraw
async function withdraw(amount) {
    const response = await fetch(`${API_BASE_URL}/api/withdraw`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({session_token: sessionToken, amount})
    });
    return await response.json();
}

// Get Transactions
async function getTransactions() {
    const response = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({session_token: sessionToken})
    });
    return await response.json();
}

// Usage Example
(async () => {
    console.log(await register('testuser', 'password123'));
    console.log(await login('testuser', 'password123'));
    console.log(await getBalance());
    console.log(await deposit(1000));
    console.log(await withdraw(300));
    console.log(await getTransactions());
})();
```

---

## 📄 OpenAPI/Swagger Format

```yaml
openapi: 3.0.0
info:
  title: Bank Management API
  version: 1.0.0
  description: RESTful API for bank management system

servers:
  - url: http://127.0.0.1:8080

paths:
  /api/register:
    post:
      summary: Register new account
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                  minLength: 3
                password:
                  type: string
                  minLength: 6
      responses:
        '201':
          description: Account created
        '400':
          description: Invalid input
        '409':
          description: Username exists
```

---

## 🚀 Production Deployment Notes

### API Security Enhancements Needed
- [ ] Implement HTTPS/TLS
- [ ] Add API key authentication
- [ ] Implement rate limiting
- [ ] Add request signing
- [ ] Use short-lived tokens with refresh tokens
- [ ] Implement token expiration
- [ ] Add CORS configuration
- [ ] Add request validation middleware

### Performance Optimization
- [ ] Add caching headers
- [ ] Implement pagination for transactions
- [ ] Add database connection pooling
- [ ] Use Redis for session storage
- [ ] Add response compression
- [ ] Monitor API response times

---

## 📞 API Error Handling

All errors follow this format:

```json
{
    "success": false,
    "message": "Human-readable error description"
}
```

Always check `success` field first, then read `message` for details.

---

**Happy API Development! 🚀**

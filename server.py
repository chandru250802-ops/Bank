from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database connection string from environment
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://neondb_owner:npg_nIPaFKf2rp6x@ep-crimson-hill-a4ef2pzo-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require')

# Global sessions storage
sessions = {}

def get_db_connection():
    """Create database connection"""
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Drop existing tables to start fresh
        cur.execute('DROP TABLE IF EXISTS transactions CASCADE')
        cur.execute('DROP TABLE IF EXISTS users CASCADE')
        
        # Create users table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                balance DECIMAL(10, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create transactions table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                type VARCHAR(20) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                balance_after DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        print("Database tables initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    # Validation
    if not username or len(username) < 3:
        return jsonify({'success': False, 'message': 'Username must be at least 3 characters'}), 400
    
    if not password or len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Check if user exists
        cur.execute('SELECT id FROM users WHERE username = %s', (username,))
        if cur.fetchone():
            return jsonify({'success': False, 'message': 'Username already exists'}), 400
        
        # Create user
        cur.execute(
            'INSERT INTO users (username, password, balance) VALUES (%s, %s, %s)',
            (username, password, 0)
        )
        
        conn.commit()
        return jsonify({'success': True, 'message': 'User registered successfully'}), 201
    except Exception as e:
        conn.rollback()
        print(f"Error registering user: {e}")
        return jsonify({'success': False, 'message': 'Registration failed'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute('SELECT id, username, password FROM users WHERE username = %s', (username,))
        user = cur.fetchone()
        
        if not user or user['password'] != password:
            return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
        
        # Create session
        session_token = str(uuid.uuid4())
        sessions[session_token] = {'user_id': user['id'], 'username': user['username']}
        
        return jsonify({
            'success': True,
            'session_token': session_token,
            'username': user['username']
        }), 200
    except Exception as e:
        print(f"Error logging in: {e}")
        return jsonify({'success': False, 'message': 'Login failed'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/logout', methods=['POST'])
def logout():
    """Logout user"""
    data = request.get_json()
    session_token = data.get('session_token', '')
    
    if session_token in sessions:
        del sessions[session_token]
    
    return jsonify({'success': True}), 200

@app.route('/api/balance', methods=['POST'])
def get_balance():
    """Get user balance"""
    data = request.get_json()
    session_token = data.get('session_token', '')
    
    if session_token not in sessions:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    user_id = sessions[session_token]['user_id']
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute('SELECT balance FROM users WHERE id = %s', (user_id,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'balance': float(user['balance'])
        }), 200
    except Exception as e:
        print(f"Error getting balance: {e}")
        return jsonify({'success': False, 'message': 'Error getting balance'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/deposit', methods=['POST'])
def deposit():
    """Deposit money"""
    data = request.get_json()
    session_token = data.get('session_token', '')
    amount = data.get('amount', 0)
    
    if session_token not in sessions:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    if amount <= 0:
        return jsonify({'success': False, 'message': 'Invalid amount'}), 400
    
    user_id = sessions[session_token]['user_id']
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Get current balance
        cur.execute('SELECT balance FROM users WHERE id = %s', (user_id,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        new_balance = float(user['balance']) + float(amount)
        
        # Update balance
        cur.execute(
            'UPDATE users SET balance = %s WHERE id = %s',
            (new_balance, user_id)
        )
        
        # Record transaction
        cur.execute(
            'INSERT INTO transactions (user_id, type, amount, balance_after) VALUES (%s, %s, %s, %s)',
            (user_id, 'DEPOSIT', amount, new_balance)
        )
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Deposit successful',
            'balance': new_balance
        }), 200
    except Exception as e:
        conn.rollback()
        print(f"Error during deposit: {e}")
        return jsonify({'success': False, 'message': 'Deposit failed'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/withdraw', methods=['POST'])
def withdraw():
    """Withdraw money"""
    data = request.get_json()
    session_token = data.get('session_token', '')
    amount = data.get('amount', 0)
    
    if session_token not in sessions:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    if amount <= 0:
        return jsonify({'success': False, 'message': 'Invalid amount'}), 400
    
    user_id = sessions[session_token]['user_id']
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Get current balance
        cur.execute('SELECT balance FROM users WHERE id = %s', (user_id,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        current_balance = float(user['balance'])
        
        if current_balance < amount:
            return jsonify({'success': False, 'message': 'Insufficient balance'}), 400
        
        new_balance = current_balance - float(amount)
        
        # Update balance
        cur.execute(
            'UPDATE users SET balance = %s WHERE id = %s',
            (new_balance, user_id)
        )
        
        # Record transaction
        cur.execute(
            'INSERT INTO transactions (user_id, type, amount, balance_after) VALUES (%s, %s, %s, %s)',
            (user_id, 'WITHDRAW', amount, new_balance)
        )
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Withdrawal successful',
            'balance': new_balance
        }), 200
    except Exception as e:
        conn.rollback()
        print(f"Error during withdrawal: {e}")
        return jsonify({'success': False, 'message': 'Withdrawal failed'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/transactions', methods=['POST'])
def get_transactions():
    """Get transaction history"""
    data = request.get_json()
    session_token = data.get('session_token', '')
    
    if session_token not in sessions:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    user_id = sessions[session_token]['user_id']
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            'SELECT type, amount, balance_after, created_at FROM transactions WHERE user_id = %s ORDER BY created_at DESC LIMIT 50',
            (user_id,)
        )
        transactions_list = cur.fetchall()
        
        # Format transactions
        transactions_data = []
        for trans in transactions_list:
            transactions_data.append({
                'type': trans['type'],
                'amount': float(trans['amount']),
                'balance_after': float(trans['balance_after']),
                'date': trans['created_at'].isoformat() if trans['created_at'] else None
            })
        
        return jsonify({
            'success': True,
            'transactions': transactions_data
        }), 200
    except Exception as e:
        print(f"Error getting transactions: {e}")
        return jsonify({'success': False, 'message': 'Error getting transactions'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/', methods=['GET'])
def index():
    """Health check / root route"""
    return jsonify({'status': 'Bank API server running on port 8080'}), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    print("Initializing database...")
    init_db()
    
    # Get configuration from environment
    host = os.getenv('HOST', '127.0.0.1')
    port = int(os.getenv('PORT', 8080))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"Starting Flask server on http://{host}:{port}")
    app.run(host=host, port=port, debug=debug)

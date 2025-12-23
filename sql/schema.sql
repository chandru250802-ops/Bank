-- Bank Management System Database Schema
-- PostgreSQL

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transaction history table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,  -- 'DEPOSIT' or 'WITHDRAW'
    amount DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_user_transactions ON transactions(user_id);
CREATE INDEX idx_transaction_date ON transactions(transaction_date);

-- Sample data (optional - for testing)
-- INSERT INTO users (username, password, balance) VALUES 
-- ('john_doe', 'hashed_password_here', 5000.00),
-- ('jane_smith', 'hashed_password_here', 3000.00);

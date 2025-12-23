// ==================== GLOBAL VARIABLES ====================
const API_BASE_URL = 'https://bank-9k0m.onrender.com'; // Render backend URL
const USE_MOCK_DATA = false; // Set to true for offline testing
let currentSessionToken = null;
let currentUsername = null;
let mockAccounts = {}; // Stores user accounts in browser memory
let mockTransactions = []; // Stores transactions in browser memory

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in (from localStorage)
    const savedSession = localStorage.getItem('sessionToken');
    if (savedSession) {
        currentSessionToken = savedSession;
        currentUsername = localStorage.getItem('username');
        showDashboard();
    } else {
        showAuthSection();
    }
});

// ==================== TAB SWITCHING ====================
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    // Clear messages
    clearMessages();
}

// ==================== REGISTER HANDLER ====================
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const messageDiv = document.getElementById('register-message');

    // Validation
    if (username.length < 3) {
        showMessage(messageDiv, 'Username must be at least 3 characters', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage(messageDiv, 'Password must be at least 6 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage(messageDiv, 'Passwords do not match', 'error');
        return;
    }

    if (USE_MOCK_DATA) {
        // Mock registration
        if (mockAccounts[username]) {
            showMessage(messageDiv, 'Username already exists', 'error');
            return;
        }
        
        mockAccounts[username] = {
            password: password,
            balance: 5000, // Start with $5000
            created: new Date().toISOString()
        };
        
        showMessage(messageDiv, 'Account created successfully! Please log in.', 'success');
        document.querySelector('#register-tab form').reset();
        setTimeout(() => {
            document.querySelector('.tab-button').click();
        }, 1500);
    } else {
        try {
            const response = await fetch(API_BASE_URL + '/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(messageDiv, 'Account created successfully! Please log in.', 'success');
                document.querySelector('#register-tab form').reset();
                setTimeout(() => {
                    document.querySelector('.tab-button').click();
                }, 1500);
            } else {
                showMessage(messageDiv, data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(messageDiv, 'Connection error. Please try again.', 'error');
        }
    }
}

// ==================== LOGIN HANDLER ====================
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('login-message');

    // Validation
    if (!username || !password) {
        showMessage(messageDiv, 'Please enter username and password', 'error');
        return;
    }

    if (USE_MOCK_DATA) {
        // Mock login
        if (!mockAccounts[username] || mockAccounts[username].password !== password) {
            showMessage(messageDiv, 'Invalid username or password', 'error');
            return;
        }
        
        // Create mock session
        currentSessionToken = 'mock-token-' + Math.random().toString(36).substr(2, 9);
        currentUsername = username;
        
        // Save to localStorage
        localStorage.setItem('sessionToken', currentSessionToken);
        localStorage.setItem('username', currentUsername);
        
        showMessage(messageDiv, 'Login successful!', 'success');
        setTimeout(() => {
            showDashboard();
        }, 500);
    } else {
        try {
            const response = await fetch(API_BASE_URL + '/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                currentSessionToken = data.session_token;
                currentUsername = data.username;
                localStorage.setItem('sessionToken', currentSessionToken);
                localStorage.setItem('username', currentUsername);
                showMessage(messageDiv, 'Login successful!', 'success');
                setTimeout(() => {
                    showDashboard();
                }, 500);
            } else {
                showMessage(messageDiv, data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(messageDiv, 'Connection error. Please try again.', 'error');
        }
    }
}

// ==================== LOGOUT HANDLER ====================
async function logout() {
    try {
        await fetch(API_BASE_URL + '/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_token: currentSessionToken
            })
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    // Clear session
    currentSessionToken = null;
    currentUsername = null;
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('username');

    // Show auth section
    showAuthSection();
}

// ==================== DEPOSIT HANDLER ====================
async function handleDeposit() {
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    const messageDiv = document.getElementById('deposit-message');

    // Validation
    if (!amount || amount <= 0) {
        showMessage(messageDiv, 'Please enter a valid amount', 'error');
        return;
    }

    if (USE_MOCK_DATA) {
        // Mock deposit
        mockAccounts[currentUsername].balance += amount;
        
        mockTransactions.push({
            type: 'DEPOSIT',
            amount: amount,
            balance_after: mockAccounts[currentUsername].balance,
            date: new Date().toISOString()
        });
        
        showMessage(messageDiv, `Deposited ₹${amount.toFixed(2)} successfully!`, 'success');
        document.getElementById('deposit-amount').value = '';
        refreshBalance();
        setTimeout(() => loadTransactions(), 500);
    } else {
        try {
            const response = await fetch(API_BASE_URL + '/api/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_token: currentSessionToken,
                    amount: amount
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(messageDiv, `Deposited ₹${amount.toFixed(2)} successfully!`, 'success');
                document.getElementById('deposit-amount').value = '';
                refreshBalance();
                setTimeout(() => loadTransactions(), 500);
            } else {
                showMessage(messageDiv, data.message || 'Deposit failed', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(messageDiv, 'Connection error. Please try again.', 'error');
        }
    }
}

// ==================== WITHDRAW HANDLER ====================
async function handleWithdraw() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const messageDiv = document.getElementById('withdraw-message');

    // Validation
    if (!amount || amount <= 0) {
        showMessage(messageDiv, 'Please enter a valid amount', 'error');
        return;
    }

    if (USE_MOCK_DATA) {
        // Mock withdraw
        if (mockAccounts[currentUsername].balance < amount) {
            showMessage(messageDiv, 'Insufficient balance', 'error');
            return;
        }
        
        mockAccounts[currentUsername].balance -= amount;
        
        mockTransactions.push({
            type: 'WITHDRAW',
            amount: amount,
            balance_after: mockAccounts[currentUsername].balance,
            date: new Date().toISOString()
        });
        
        showMessage(messageDiv, `Withdrawn ₹${amount.toFixed(2)} successfully!`, 'success');
        document.getElementById('withdraw-amount').value = '';
        refreshBalance();
        setTimeout(() => loadTransactions(), 500);
    } else {
        try {
            const response = await fetch(API_BASE_URL + '/api/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_token: currentSessionToken,
                    amount: amount
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(messageDiv, `Withdrawn ₹${amount.toFixed(2)} successfully!`, 'success');
                document.getElementById('withdraw-amount').value = '';
                refreshBalance();
                setTimeout(() => loadTransactions(), 500);
            } else {
                showMessage(messageDiv, data.message || 'Withdrawal failed', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(messageDiv, 'Connection error. Please try again.', 'error');
        }
    }
}

// ==================== REFRESH BALANCE ====================
async function refreshBalance() {
    if (USE_MOCK_DATA) {
        // Mock balance refresh
        const balance = mockAccounts[currentUsername].balance;
        document.getElementById('balance-display').textContent = '₹' + balance.toFixed(2);
    } else {
        try {
            const response = await fetch(API_BASE_URL + '/api/balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_token: currentSessionToken
                })
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('balance-display').textContent = '₹' + parseFloat(data.balance).toFixed(2);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    }
}

// ==================== LOAD TRANSACTIONS ====================
async function loadTransactions() {
    if (USE_MOCK_DATA) {
        // Mock transactions
        displayTransactions(mockTransactions);
    } else {
        try {
            const response = await fetch(API_BASE_URL + '/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_token: currentSessionToken
                })
            });

            const data = await response.json();

            if (data.success) {
                displayTransactions(data.transactions);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }
}

// ==================== DISPLAY TRANSACTIONS ====================
function displayTransactions(transactions) {
    const transactionsList = document.getElementById('transactions-list');

    if (!transactions || transactions.length === 0) {
        transactionsList.innerHTML = '<p class="placeholder">No transactions yet</p>';
        return;
    }

    let html = '';
    transactions.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleString();
        const amount = parseFloat(transaction.amount).toFixed(2);
        const balance = parseFloat(transaction.balance_after).toFixed(2);
        const isDeposit = transaction.type === 'DEPOSIT';

        html += `
            <div class="transaction-item">
                <div style="flex: 1;">
                    <div class="transaction-type ${isDeposit ? 'deposit' : 'withdraw'}">
                        ${isDeposit ? '📥 Deposit' : '📤 Withdrawal'}
                    </div>
                    <div class="transaction-date">${date}</div>
                </div>
                <div style="text-align: right;">
                    <div class="transaction-amount ${isDeposit ? 'deposit' : 'withdraw'}">
                        ${isDeposit ? '+' : '-'}₹${amount}
                    </div>
                    <div style="font-size: 0.9rem; color: #666;">Balance: ₹${balance}</div>
                </div>
            </div>
        `;
    });

    transactionsList.innerHTML = html;
}

// ==================== SHOW/HIDE SECTIONS ====================
function showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('nav-user-info').style.display = 'none';
}

function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('nav-user-info').style.display = 'flex';

    // Update UI with current user info
    document.getElementById('nav-username').textContent = currentUsername;
    document.getElementById('username-display').textContent = currentUsername;

    // Load initial data
    refreshBalance();
    loadTransactions();
}

// ==================== UTILITY FUNCTIONS ====================
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = 'message ' + type;

    // Auto-clear error messages after 5 seconds
    if (type === 'error') {
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
        }, 5000);
    }
}

function clearMessages() {
    document.getElementById('login-message').textContent = '';
    document.getElementById('login-message').className = 'message';
    document.getElementById('register-message').textContent = '';
    document.getElementById('register-message').className = 'message';
}

// ==================== SESSION PERSISTENCE ====================
// Check session validity periodically
setInterval(() => {
    if (currentSessionToken) {
        if (!USE_MOCK_DATA) {
            // Verify session is still valid by fetching balance (real API only)
            fetch(API_BASE_URL + '/api/balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_token: currentSessionToken
                })
            }).catch(() => {
                // Session expired or server unreachable
                logout();
            });
        }
        // Mock data: session is always valid, no need to check
    }
}, 30000); // Check every 30 seconds

// ==================== PAGE VISIBILITY ====================
// Auto-logout if user closes the tab/window
window.addEventListener('beforeunload', () => {
    if (currentSessionToken) {
        // Send logout request (without waiting)
        navigator.sendBeacon(API_BASE_URL + '/api/logout', JSON.stringify({
            session_token: currentSessionToken
        }));
    }
});

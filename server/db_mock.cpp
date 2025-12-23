#include "db.h"
#include <iostream>
#include <sstream>
#include <cstring>
#include <algorithm>
#include <ctime>

using namespace std;

// In-memory storage for mock database
static map<string, Database::User> users;
static map<string, vector<Database::Transaction>> transactions;
static int transaction_id_counter = 1;

Database::Database(const string& connStr) : connection_string(connStr) {}

Database::~Database() {}

bool Database::connect() {
    // Mock connection always succeeds
    cout << "Mock database connected" << endl;
    return true;
}

bool Database::disconnect() {
    cout << "Mock database disconnected" << endl;
    return true;
}

bool Database::registerUser(const string& username, const string& password) {
    if (users.find(username) != users.end()) {
        return false; // User already exists
    }
    
    User user;
    user.id = users.size() + 1;
    user.username = username;
    user.password_hash = password; // In real app, would hash this
    user.balance = 5000.0; // Starting balance
    user.created_at = time(nullptr);
    
    users[username] = user;
    transactions[username] = vector<Transaction>();
    
    cout << "User registered: " << username << endl;
    return true;
}

bool Database::authenticateUser(const string& username, const string& password) {
    auto it = users.find(username);
    if (it == users.end()) {
        return false; // User not found
    }
    
    return it->second.password_hash == password;
}

double Database::getBalance(const string& username) {
    auto it = users.find(username);
    if (it == users.end()) {
        return -1.0;
    }
    return it->second.balance;
}

bool Database::deposit(const string& username, double amount) {
    auto it = users.find(username);
    if (it == users.end() || amount <= 0) {
        return false;
    }
    
    it->second.balance += amount;
    
    // Record transaction
    Transaction trans;
    trans.id = transaction_id_counter++;
    trans.user_id = it->second.id;
    trans.type = "DEPOSIT";
    trans.amount = amount;
    trans.balance_after = it->second.balance;
    trans.timestamp = time(nullptr);
    
    transactions[username].push_back(trans);
    
    cout << "Deposit: " << username << " + $" << amount << " = $" << it->second.balance << endl;
    return true;
}

bool Database::withdraw(const string& username, double amount) {
    auto it = users.find(username);
    if (it == users.end() || amount <= 0 || it->second.balance < amount) {
        return false;
    }
    
    it->second.balance -= amount;
    
    // Record transaction
    Transaction trans;
    trans.id = transaction_id_counter++;
    trans.user_id = it->second.id;
    trans.type = "WITHDRAW";
    trans.amount = amount;
    trans.balance_after = it->second.balance;
    trans.timestamp = time(nullptr);
    
    transactions[username].push_back(trans);
    
    cout << "Withdraw: " << username << " - $" << amount << " = $" << it->second.balance << endl;
    return true;
}

vector<Database::Transaction> Database::getTransactions(const string& username) {
    auto it = transactions.find(username);
    if (it == transactions.end()) {
        return vector<Transaction>();
    }
    return it->second;
}

json Database::getUsersJson() {
    json result = json::array();
    for (auto& pair : users) {
        json user_obj;
        user_obj["id"] = pair.second.id;
        user_obj["username"] = pair.second.username;
        user_obj["balance"] = pair.second.balance;
        result.push_back(user_obj);
    }
    return result;
}

json Database::getTransactionsJson(const string& username) {
    json result = json::array();
    auto it = transactions.find(username);
    if (it != transactions.end()) {
        for (auto& trans : it->second) {
            json trans_obj;
            trans_obj["id"] = trans.id;
            trans_obj["type"] = trans.type;
            trans_obj["amount"] = trans.amount;
            trans_obj["balance_after"] = trans.balance_after;
            trans_obj["timestamp"] = trans.timestamp;
            result.push_back(trans_obj);
        }
    }
    return result;
}

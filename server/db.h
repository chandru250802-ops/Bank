#ifndef DB_H
#define DB_H

#include <string>
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using namespace std;

class Database {
private:
    string connection_string;

public:
    Database(const string& connStr);
    ~Database();

    // User Management
    bool createUser(const string& username, const string& password);
    bool validateUser(const string& username, const string& password);
    int getUserId(const string& username);
    string getUsername(int user_id);

    // Account Operations
    double getBalance(int user_id);
    bool deposit(int user_id, double amount);
    bool withdraw(int user_id, double amount);

    // Transaction History
    json getTransactionHistory(int user_id);

    // Utility
    bool checkUserExists(const string& username);
    string hashPassword(const string& password);
    bool verifyPassword(const string& password, const string& hash);
};

#endif

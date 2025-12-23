#include "crow_all.hpp"
#include "db.h"
#include <iostream>
#include <map>

using namespace std;

// Global database instance
Database* g_db = nullptr;

// Session management (store logged-in users)
map<string, pair<int, string>> sessions; // session_id -> (user_id, username)

// Simple session token generator
string generateSessionToken() {
    static int counter = 0;
    return "session_" + to_string(counter++) + "_" + to_string(time(nullptr));
}

int main() {
    // Initialize database connection
    // Adjust connection parameters as needed
    g_db = new Database("dbname=bank_management user=postgres password=root host=127.0.0.1");

    crow::SimpleApp app;

    // ==================== REGISTER ENDPOINT ====================
    CROW_ROUTE(app, "/api/register").methods("POST"_method)
    ([](const crow::request& req) {
        auto body = crow::json::load(req.body);

        if (!body || !body.has("username") || !body.has("password")) {
            return crow::response(400, crow::json::wvalue{
                {"success", false},
                {"message", "Username and password required"}
            }.dump());
        }

        string username = body["username"].s();
        string password = body["password"].s();

        if (username.length() < 3 || password.length() < 6) {
            return crow::response(400, crow::json::wvalue{
                {"success", false},
                {"message", "Username must be 3+ chars, password 6+ chars"}
            }.dump());
        }

        if (g_db->checkUserExists(username)) {
            return crow::response(409, crow::json::wvalue{
                {"success", false},
                {"message", "Username already exists"}
            }.dump());
        }

        if (g_db->createUser(username, password)) {
            return crow::response(201, crow::json::wvalue{
                {"success", true},
                {"message", "Account created successfully"}
            }.dump());
        } else {
            return crow::response(500, crow::json::wvalue{
                {"success", false},
                {"message", "Error creating account"}
            }.dump());
        }
    });

    // ==================== LOGIN ENDPOINT ====================
    CROW_ROUTE(app, "/api/login").methods("POST"_method)
    ([](const crow::request& req) {
        auto body = crow::json::load(req.body);

        if (!body || !body.has("username") || !body.has("password")) {
            return crow::response(400, crow::json::wvalue{
                {"success", false},
                {"message", "Username and password required"}
            }.dump());
        }

        string username = body["username"].s();
        string password = body["password"].s();

        if (!g_db->validateUser(username, password)) {
            return crow::response(401, crow::json::wvalue{
                {"success", false},
                {"message", "Invalid username or password"}
            }.dump());
        }

        int user_id = g_db->getUserId(username);
        string session_token = generateSessionToken();

        sessions[session_token] = {user_id, username};

        return crow::response(200, crow::json::wvalue{
            {"success", true},
            {"message", "Login successful"},
            {"session_token", session_token},
            {"username", username}
        }.dump());
    });

    // ==================== LOGOUT ENDPOINT ====================
    CROW_ROUTE(app, "/api/logout").methods("POST"_method)
    ([](const crow::request& req) {
        auto body = crow::json::load(req.body);

        if (!body || !body.has("session_token")) {
            return crow::response(400, crow::json::wvalue{
                {"success", false},
                {"message", "Session token required"}
            }.dump());
        }

        string session_token = body["session_token"].s();
        sessions.erase(session_token);

        return crow::response(200, crow::json::wvalue{
            {"success", true},
            {"message", "Logged out successfully"}
        }.dump());
    });

    // ==================== GET BALANCE ENDPOINT ====================
    CROW_ROUTE(app, "/api/balance").methods("POST"_method)
    ([](const crow::request& req) {
        auto body = crow::json::load(req.body);

        if (!body || !body.has("session_token")) {
            return crow::response(401, crow::json::wvalue{
                {"success", false},
                {"message", "Unauthorized - session token required"}
            }.dump());
        }

        string session_token = body["session_token"].s();

        if (sessions.find(session_token) == sessions.end()) {
            return crow::response(401, crow::json::wvalue{
                {"success", false},
                {"message", "Unauthorized - invalid session"}
            }.dump());
        }

        int user_id = sessions[session_token].first;
        double balance = g_db->getBalance(user_id);

        if (balance < 0) {
            return crow::response(500, crow::json::wvalue{
                {"success", false},
                {"message", "Error retrieving balance"}
            }.dump());
        }

        return crow::response(200, crow::json::wvalue{
            {"success", true},
            {"balance", balance},
            {"username", sessions[session_token].second}
        }.dump());
    });

    // ==================== DEPOSIT ENDPOINT ====================
    CROW_ROUTE(app, "/api/deposit").methods("POST"_method)
    ([](const crow::request& req) {
        auto body = crow::json::load(req.body);

        if (!body || !body.has("session_token") || !body.has("amount")) {
            return crow::response(400, crow::json::wvalue{
                {"success", false},
                {"message", "Session token and amount required"}
            }.dump());
        }

        string session_token = body["session_token"].s();
        double amount = body["amount"].d();

        if (sessions.find(session_token) == sessions.end()) {
            return crow::response(401, crow::json::wvalue{
                {"success", false},
                {"message", "Unauthorized - invalid session"}
            }.dump());
        }

        if (amount <= 0) {
            return crow::response(400, crow::json::wvalue{
                {"success", false},
                {"message", "Amount must be greater than 0"}
            }.dump());
        }

        int user_id = sessions[session_token].first;

        if (g_db->deposit(user_id, amount)) {
            double new_balance = g_db->getBalance(user_id);
            return crow::response(200, crow::json::wvalue{
                {"success", true},
                {"message", "Deposit successful"},
                {"new_balance", new_balance},
                {"amount_deposited", amount}
            }.dump());
        } else {
            return crow::response(500, crow::json::wvalue{
                {"success", false},
                {"message", "Error processing deposit"}
            }.dump());
        }
    });

    // ==================== WITHDRAW ENDPOINT ====================
    CROW_ROUTE(app, "/api/withdraw").methods("POST"_method)
    ([](const crow::request& req) {
        auto body = crow::json::load(req.body);

        if (!body || !body.has("session_token") || !body.has("amount")) {
            return crow::response(400, crow::json::wvalue{
                {"success", false},
                {"message", "Session token and amount required"}
            }.dump());
        }

        string session_token = body["session_token"].s();
        double amount = body["amount"].d();

        if (sessions.find(session_token) == sessions.end()) {
            return crow::response(401, crow::json::wvalue{
                {"success", false},
                {"message", "Unauthorized - invalid session"}
            }.dump());
        }

        if (amount <= 0) {
            return crow::response(400, crow::json::wvalue{
                {"success", false},
                {"message", "Amount must be greater than 0"}
            }.dump());
        }

        int user_id = sessions[session_token].first;
        double current_balance = g_db->getBalance(user_id);

        if (current_balance < amount) {
            return crow::response(400, crow::json::wvalue{
                {"success", false},
                {"message", "Insufficient balance"},
                {"current_balance", current_balance}
            }.dump());
        }

        if (g_db->withdraw(user_id, amount)) {
            double new_balance = g_db->getBalance(user_id);
            return crow::response(200, crow::json::wvalue{
                {"success", true},
                {"message", "Withdrawal successful"},
                {"new_balance", new_balance},
                {"amount_withdrawn", amount}
            }.dump());
        } else {
            return crow::response(500, crow::json::wvalue{
                {"success", false},
                {"message", "Error processing withdrawal"}
            }.dump());
        }
    });

    // ==================== GET TRANSACTION HISTORY ====================
    CROW_ROUTE(app, "/api/transactions").methods("POST"_method)
    ([](const crow::request& req) {
        auto body = crow::json::load(req.body);

        if (!body || !body.has("session_token")) {
            return crow::response(401, crow::json::wvalue{
                {"success", false},
                {"message", "Unauthorized"}
            }.dump());
        }

        string session_token = body["session_token"].s();

        if (sessions.find(session_token) == sessions.end()) {
            return crow::response(401, crow::json::wvalue{
                {"success", false},
                {"message", "Unauthorized - invalid session"}
            }.dump());
        }

        int user_id = sessions[session_token].first;
        auto transactions = g_db->getTransactionHistory(user_id);

        return crow::response(200, crow::json::wvalue{
            {"success", true},
            {"transactions", transactions}
        }.dump());
    });

    // ==================== SERVE STATIC FILES ====================
    CROW_ROUTE(app, "/").methods("GET"_method)
    ([]() {
        return crow::response(crow::status::ok, crow::json::wvalue{
            {"message", "Bank Management System API"},
            {"endpoints", crow::json::wvalue{
                {"register", "/api/register (POST)"},
                {"login", "/api/login (POST)"},
                {"logout", "/api/logout (POST)"},
                {"balance", "/api/balance (POST)"},
                {"deposit", "/api/deposit (POST)"},
                {"withdraw", "/api/withdraw (POST)"},
                {"transactions", "/api/transactions (POST)"}
            }}
        }.dump());
    });

    cout << "🚀 Bank Management System Server starting..." << endl;
    cout << "📍 Server running on http://127.0.0.1:8080" << endl;
    cout << "📚 API documentation available at http://127.0.0.1:8080/api/docs" << endl;

    app.port(8080).run();

    delete g_db;
    return 0;
}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var sqlite3_1 = require("sqlite3");
var sqlite_1 = require("sqlite");
var express_session_1 = require("express-session");
var multer_1 = require("multer");
var path_1 = require("path");
var fs_1 = require("fs");
var app = (0, express_1.default)();
var PORT = 4000;
var upload = (0, multer_1.default)({ dest: 'uploads/' });
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({ secret: 'dev', resave: false, saveUninitialized: true }));
var db;
function initDb() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sqlite_1.open)({
                        filename: './offer-manager.db',
                        driver: sqlite3_1.default.Database
                    })];
                case 1:
                    db = _a.sent();
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS users (\n      id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT\n    );\n    CREATE TABLE IF NOT EXISTS requests (\n      id INTEGER PRIMARY KEY, title TEXT, description TEXT, userId INTEGER\n    );\n    CREATE TABLE IF NOT EXISTS offers (\n      id INTEGER PRIMARY KEY, requestId INTEGER, amount REAL, userId INTEGER\n    );\n  ")];
                case 2:
                    _a.sent();
                    // Add a default user
                    return [4 /*yield*/, db.run('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)', ['admin', 'admin'])];
                case 3:
                    // Add a default user
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Use this if __dirname is not defined (ESM workaround)
var UPLOADS_DIR = path_1.default.join(process.cwd(), 'uploads');
// Auth endpoints
app.post('/api/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, user;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, password = _a.password;
                if (!db)
                    return [2 /*return*/, res.status(500).json({ error: 'DB not initialized' })];
                return [4 /*yield*/, db.get('SELECT * FROM users WHERE username = ? AND password = ?', username, password)];
            case 1:
                user = _b.sent();
                if (user) {
                    req.session.userId = user.id;
                    res.json({ success: true });
                }
                else {
                    res.status(401).json({ error: 'Invalid credentials' });
                }
                return [2 /*return*/];
        }
    });
}); });
app.post('/api/logout', function (req, res) {
    req.session.destroy(function () { return res.json({ success: true }); });
});
app.get('/api/me', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.session.userId)
                    return [2 /*return*/, res.status(401).json({ error: 'Not logged in' })];
                if (!db)
                    return [2 /*return*/, res.status(500).json({ error: 'DB not initialized' })];
                return [4 /*yield*/, db.get('SELECT id, username FROM users WHERE id = ?', req.session.userId)];
            case 1:
                user = _a.sent();
                res.json(user);
                return [2 /*return*/];
        }
    });
}); });
// Requests CRUD
app.get('/api/requests', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requests;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db)
                    return [2 /*return*/, res.status(500).json({ error: 'DB not initialized' })];
                return [4 /*yield*/, db.all('SELECT * FROM requests')];
            case 1:
                requests = _a.sent();
                res.json(requests);
                return [2 /*return*/];
        }
    });
}); });
app.post('/api/requests', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, title = _a.title, description = _a.description;
                if (!req.session.userId)
                    return [2 /*return*/, res.status(401).json({ error: 'Not logged in' })];
                if (!db)
                    return [2 /*return*/, res.status(500).json({ error: 'DB not initialized' })];
                return [4 /*yield*/, db.run('INSERT INTO requests (title, description, userId) VALUES (?, ?, ?)', title, description, req.session.userId)];
            case 1:
                result = _b.sent();
                res.json({ id: result.lastID });
                return [2 /*return*/];
        }
    });
}); });
// Offers CRUD
app.get('/api/offers', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var offers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db)
                    return [2 /*return*/, res.status(500).json({ error: 'DB not initialized' })];
                return [4 /*yield*/, db.all('SELECT * FROM offers')];
            case 1:
                offers = _a.sent();
                res.json(offers);
                return [2 /*return*/];
        }
    });
}); });
app.post('/api/offers', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, requestId, amount, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, requestId = _a.requestId, amount = _a.amount;
                if (!req.session.userId)
                    return [2 /*return*/, res.status(401).json({ error: 'Not logged in' })];
                if (!db)
                    return [2 /*return*/, res.status(500).json({ error: 'DB not initialized' })];
                return [4 /*yield*/, db.run('INSERT INTO offers (requestId, amount, userId) VALUES (?, ?, ?)', requestId, amount, req.session.userId)];
            case 1:
                result = _b.sent();
                res.json({ id: result.lastID });
                return [2 /*return*/];
        }
    });
}); });
// File upload/download
app.post('/api/files', upload.single('file'), function (req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ filename: req.file.filename, originalname: req.file.originalname });
});
app.get('/api/files/:filename', function (req, res) {
    // Use UPLOADS_DIR instead of __dirname
    var filePath = path_1.default.join(UPLOADS_DIR, req.params.filename);
    if (fs_1.default.existsSync(filePath)) {
        res.sendFile(filePath);
    }
    else {
        res.status(404).json({ error: 'File not found' });
    }
});
initDb().then(function () {
    app.listen(PORT, function () { return console.log("Backend running on http://localhost:".concat(PORT)); });
});

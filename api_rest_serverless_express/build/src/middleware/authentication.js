"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var secretKey = 'secretkey';
function authMiddleware(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token)
        res.status(403).json({ message: 'token not found' });
    jsonwebtoken_1.default.verify(token, secretKey, function (err, decode) {
        if (err)
            res.status(401).json({ message: 'invalid token' });
        req.decoded = decode;
        next();
    });
}
exports.authMiddleware = authMiddleware;
;
//# sourceMappingURL=authentication.js.map
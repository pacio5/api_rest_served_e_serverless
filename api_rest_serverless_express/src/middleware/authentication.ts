import { Request, Response } from "express";
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

const secretKey = 'secretkey';


export function authMiddleware (req: Request, res: Response, next) {
    // Recupera il token
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) res.status(403).json({ message: 'token not found' });
    // Verifica il token
    jwt.verify(token, secretKey, (err, decode) => {
        if (err) res.status(401).json({ message: 'invalid token' });
        req.decoded = decode;
        next();
    });
};

import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

const secretKey = 'secretkey';

export function auth (event): boolean {
    const token = event.body.token || event.query.token || event.headers['x-access-token'];
    if (!token) return false;
    jwt.verify(token, secretKey, (err, decode) => {
        if (err) return false;
        event.body.decoded = decode;
        return true;
    });
};

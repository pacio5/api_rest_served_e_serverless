import jwt from 'jsonwebtoken';
import querystring from 'querystring';

const secretKey = 'secretkey';

export const auth = function (event): Promise<String> {
    return new Promise(function (resolve, reject) {
        const token = querystring.parse(event.body).token || querystring.parse(event.query).token || event.headers['x-access-token'];
        if (!token) return reject(null);
        jwt.verify(token, secretKey, (err, decode) => {
            if (err) return reject(null);
            return resolve(decode.id);
        });
    })
}


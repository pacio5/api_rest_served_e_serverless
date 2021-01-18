import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from '../database/users/users.model';
import { Handler, Context, Callback } from 'aws-lambda';
import querystring from 'querystring';
import { connect, disconnect } from '../database/database';

export const login: Handler = async (event: any, context: Context, callback: Callback) => {
    const secretKey = 'secretkey';

    let data = querystring.parse(event.body);
    const user = { _id: data.email.toString(), password: data.password.toString() };
    connect();
    if (!data) return callback(null, {statusCode: 400, body: "Dati mancanti"});

    try {
        const userFind = await UserModel.findById(user._id);
        if (Object.is(userFind, null)) return callback(null, { statusCode: 400, body: `Credenziali errate` });

        if (!bcrypt.compareSync(user.password, userFind.password))
            return callback(null, { statusCode: 400, body: `Credenziali errate` });

        const token = jwt.sign({ id: userFind._id }, secretKey, { expiresIn: '1h' });

        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                message: "Accesso eseguito",
                token: token
            })
        });
    } catch (err) {
        return callback(null, { statusCode: 400, body: `Errore ${err}` });
    } finally {
        disconnect();
    }
};
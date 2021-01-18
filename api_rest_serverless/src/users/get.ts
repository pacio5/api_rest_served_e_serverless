import { UserModel } from '../database/users/users.model';
import { auth } from "../authentication";
import { Handler, Context, Callback } from 'aws-lambda';
import { connect, disconnect } from '../database/database';

export const get: Handler = async (event: any, context: Context, callback: Callback) => {
    try {
        const id = await auth(event);
        if (Object.is(id, null)) return callback(null, { status: 400, body: `Errore di autenticazione` });
        connect();
        const user = await UserModel.findById(id);
        return callback(null, { status: 200, body: JSON.stringify(user) });
    } catch (err) {
        return callback(null, { status: 400, body: `Errore ${err}` });
    } finally {
        disconnect();
    }
};
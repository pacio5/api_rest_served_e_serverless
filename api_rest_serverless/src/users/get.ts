import { UserModel } from '../database/users/users.model';
import { auth } from "../authentication";
import { Handler, Context, Callback } from 'aws-lambda';
import { connect, disconnect } from '../database/database';

export const get: Handler = async (event: any, context: Context, callback: Callback) => {
    try {
        const id = await auth(event);
        connect();
        const user = await UserModel.findById(id);
        return callback(null, { statusCode: 200, body: JSON.stringify(user) });
    } catch (err) {
        return callback(null, { statusCode: 400, body: `Errore ${err}` });
    } finally {
        disconnect();
    }
};
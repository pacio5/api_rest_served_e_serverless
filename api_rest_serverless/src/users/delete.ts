import { UserModel } from '../database/users/users.model';
import { auth } from "../authentication";
import { Handler, Context, Callback } from 'aws-lambda';
import { connect, disconnect } from '../database/database';

export const del: Handler = async (event: any, context: Context, callback: Callback) => {
    try {
        const id = await auth(event);
        if (Object.is(id, null)) return callback(null, { status: 400, body: `Errore di autenticazione` });
        connect();

        const result = await UserModel.deleteOne({ _id: id.toString() });

        if (result.n > 0)
            return callback(null, { status: 200, body: "user deleted" });
        else
            return callback(null, { status: 400, body: `Errore` });
    } catch (err) {
        return callback(null, { status: 400, body: `Errore: ${err}` });
    } finally {
        disconnect();
    }

};
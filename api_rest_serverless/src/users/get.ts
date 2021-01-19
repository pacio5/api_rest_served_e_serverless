import { UserModel } from '../database/users/users.model';
import { auth } from "../authentication";
import { Handler, Context, Callback } from 'aws-lambda';
import { connect, disconnect } from '../database/database';

/**
 * 
 * @param event contiene il jwt (x-access-token) nell'header
 * @param context 
 * @param callback funzione per inviare il risultato all'utente (successo/errore)
 * 
 * Dal token recupera l'ide dell'utente e ne restituisce il profilo se esiste
 */
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
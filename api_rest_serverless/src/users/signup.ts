import bcrypt from 'bcryptjs';
import { UserModel } from '../database/users/users.model';
import { Handler, Context, Callback } from 'aws-lambda';
import querystring from 'querystring';
import { connect, disconnect } from "../database/database";

/**
 * 
 * @param event contiene nel body email e password
 * @param context 
 * @param callback funzione per inviare il risultato all'utente (successo/errore)
 * 
 * Tramite i parametri email e password effettua la registrazione dell'utente e restituisce l'esito.
 */
export const signup: Handler = async (event: any, context: Context, callback: Callback) => {
  let data = querystring.parse(event.body);
  if (!data) return callback(null, {statusCode: 400, body: "Dati mancanti"});
  
  const user = { _id: data.email.toString(), password: bcrypt.hashSync(data.password.toString(), bcrypt.genSaltSync(5)) };
  
  try {
    connect();
    const userFind = await UserModel.findById(user._id);
    if (userFind) {
      return callback(null, { statusCode: 403, body: "Utente già esistente"});
    } else {
      const newUser = await UserModel.create(user);

      if (Object.is(newUser, null)) {
        return callback(null, { statusCode: 400, body: "Errore nella creazione" });
      } else return callback(null, { statusCode: 200, body: "Utente creato correttamente" });
    }
  } catch (err) {
    return callback(null,{statusCode:400, body: `Errore: ${err}`});
  } finally {
    disconnect();
  }
};
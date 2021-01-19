import { Handler, Context, Callback } from 'aws-lambda';

/**
 * 
 * @param event non riceve parametri dall'utente
 * @param context 
 * @param callback funzione per inviare il risultato all'utente (successo/errore)
 * 
 * Funzione per verificare se l'applicazione è online e funzionante
 */
export const online : Handler = (event: any, context: Context, callback: Callback) => {
    const response = {
        statusCode: 200,
        body: "Server online",
    };

    return callback(null, response);
};
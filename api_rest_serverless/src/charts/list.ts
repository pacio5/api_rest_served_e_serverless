import { auth } from "../authentication";
import AWS from 'aws-sdk';
import { Handler, Context, Callback } from 'aws-lambda';

/**
 * 
 * @param event non riceve parametri dall'utente
 * @param context 
 * @param callback funzione per inviare il risultato all'utente (successo/errore)
 * 
 * Restituisce tutto gli oggetti dell'utente che effettua la richiesta
 */
export const list: Handler = async (event: any, context: Context, callback: Callback) => {

    try {
        const id = await auth(event);

        // Setting up S3 list parameters
        const params = {
            Bucket: 'charts-app', // Bucket name
            Prefix: id.toString() + '/', // File name you want to save as in S3
        };

        const s3 = new AWS.S3();
        const data = await s3.listObjectsV2(params).promise();
        console.log(data);
        return callback(null, { statusCode: 200, body: JSON.stringify(data.Contents) });
    } catch (err) {
        return callback(null, { statusCode: 200, body: `Errore: ${err}` });
    }
};
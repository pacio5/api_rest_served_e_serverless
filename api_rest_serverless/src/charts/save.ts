import { auth } from "../authentication";
import { v4 as uuidv4 } from 'uuid';
import Jimp from 'jimp';
import fs from 'fs';
import AWS from 'aws-sdk';
import { Handler, Context, Callback } from 'aws-lambda';

/**
 * 
 * @param event riceve la stringa per generare il grafico 
 * @param context 
 * @param callback funzione per inviare il risultato all'utente (successo/errore)
 * 
 * Salvataggio del grafico generato in base ai parametri dell'utente
 */
export const save: Handler = async (event: any, context: Context, callback: Callback) => {
    try {
        const userId = await auth(event);

        // Generazione nome casuale per il file 
        const id: string = uuidv4();
        // Recupero il grafico dall'API di Google Chart
        let image = await Jimp.read(`https://chart.googleapis.com/chart?${event.pathParameters.chart}`);
        // Scrivo tempoaneamente l'immagine nella cartella locale
        await image.writeAsync('/tmp/' + id + '.png');

        const fileContent = fs.readFileSync('/tmp/' + id + '.png');

        // Definisco i parametri per l'upload su S3
        const params = {
            Bucket: 'charts-app', // Nome del bucket
            Key: userId.toString() + '/' + uuidv4() + '.png', // Non del file salvato su S3
            Body: fileContent, // Contenuto del file
            ACL: 'public-read' // Regole di scritture del file
        };

        const s3 = new AWS.S3();
        // Upload del file nel bucket
        const data = await s3.upload(params).promise();
        // Elimino il file salvato nella cartella temporanea
        fs.unlinkSync('/tmp/' + id + '.png');
        return callback(null, { statusCode: 200, body: "Grafico salvato correttamente: " + data.Location.toString() });

    } catch (err) { return callback(null, { statusCode: 400, body: `Errore: ${err}` }); }
};
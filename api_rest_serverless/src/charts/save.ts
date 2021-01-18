import { auth } from "../authentication";
import { v4 as uuidv4 } from 'uuid';
import Jimp from 'jimp';
import fs from 'fs';
import AWS from 'aws-sdk';
import { Handler, Context, Callback } from 'aws-lambda';


export const save: Handler = async (event: any, context: Context, callback: Callback) => {
    try {
        const userId = await auth(event);

        const id: string = uuidv4();
        let image = await Jimp.read('https://chart.googleapis.com/chart?cht=p3&chs=250x100&chd=t:60,40&chl=Hello|World');

        await image.writeAsync('/tmp/' + id + '.png');


        const fileContent = fs.readFileSync('/tmp/' + id + '.png');

        // Setting up S3 upload parameters
        const params = {
            Bucket: 'charts-app', // Bucket name
            Key: userId.toString() + '/' + uuidv4() + '.png', // File name you want to save as in S3
            Body: fileContent,
            ACL:'public-read'
        };

        const s3 = new AWS.S3();
        // Uploading files to the bucket
        const data = await s3.upload(params).promise();
        fs.unlinkSync('/tmp/' + id + '.png');
        return callback(null, {status: 200, body: "Grafico salvato correttamente: " + data.Location.toString()});

    } catch (err) { return callback(null, { status: 400, body: `Errore: ${err}` }); }
};
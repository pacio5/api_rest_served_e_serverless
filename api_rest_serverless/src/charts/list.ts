import { auth } from "../authentication";
import AWS from 'aws-sdk';
import { Handler, Context, Callback } from 'aws-lambda';

export const list: Handler = async (event: any, context: Context, callback: Callback) => {

    try {
        const id = await auth(event);
        if (Object.is(id, null)) return callback(null, { status: 400, body: `Errore di autenticazione` });

        // Setting up S3 list parameters
        const params = {
            Bucket: 'charts-app', // Bucket name
            Prefix: id.toString() + '/', // File name you want to save as in S3
        };

        const s3 = new AWS.S3();
        const data = await s3.listObjectsV2(params).promise()
        return callback(null, { status: 200, body: JSON.stringify(data.Contents) });
    } catch (err) {
        return callback(null, { status: 200, body: `Errore: ${err}` });
    }
};
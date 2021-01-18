import { auth } from "../authentication";
import AWS from 'aws-sdk';
import { Handler, Context, Callback } from 'aws-lambda';

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
        return callback(null, { status: 200, body: JSON.stringify(data.Contents) });
    } catch (err) {
        return callback(null, { status: 200, body: `Errore: ${err}` });
    }
};


`https://charts-app.s3us-east-1.amazonaws.com/eliapacioni@gmail.com/0af772e1-4182-4f3a-a699-9a5e0e8f4a2a.png`;
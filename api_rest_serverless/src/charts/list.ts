import { auth } from "../authentication";
import AWS from 'aws-sdk';
import { Handler, Context, Callback } from 'aws-lambda';

export const list : Handler = (event: any, context: Context, callback: Callback) => {
    const result = auth(event);
    if (!result) callback(new Error("unauthenticated user "));

    // Setting up S3 list parameters
    const params = {
        Bucket: 'charts-app', // Bucket name
        Prefix: JSON.parse(event.body).decoded.id + '/', // File name you want to save as in S3
    };

    const s3 = new AWS.S3();
    s3.listObjectsV2(params, function (err, data) {
        if (err) return callback(new Error("Error"));
        else {
            const response = {status: 200, data: data.Contents };
            return callback(null, response);
        }// successful response
    });
};
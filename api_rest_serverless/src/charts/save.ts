import { auth } from "../authentication";
import { v4 as uuidv4 } from 'uuid';
import Jimp from 'jimp';
import fs from 'fs';
import AWS from 'aws-sdk';

import { Handler, Context, Callback } from 'aws-lambda';


export const save : Handler = async (event: any, context: Context, callback: Callback)=> {
    const result = auth(event);
    if (!result) callback(new Error("unauthenticated user "));

    const data = JSON.parse(event.body);
    try {
        const id: string = uuidv4();
        let image = await Jimp.read('https://chart.googleapis.com/chart?cht=p3&chs=250x100&chd=t:60,40&chl=Hello|World');

        await image.writeAsync('/tmp/' + id + '.png');


        const fileContent = fs.readFileSync('/tmp/' + id + '.png');

        // Setting up S3 upload parameters
        const params = {
            Bucket: 'charts-app', // Bucket name
            Key: data.decoded.id + '/' + uuidv4() + '.png', // File name you want to save as in S3
            Body: fileContent
        };

        const s3 = new AWS.S3();
        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
            if (err) return callback(new Error("Error"));
            
            console.log(`File uploaded successfully. ${data.Location}`);
            // Delete file
            fs.unlinkSync('/tmp/' + id + '.png');
            const response = {
                status: 200,
                body: "user deleted"
            };

            return callback(null, response);
        });

    } catch (err) { return callback(new Error(`Error ${err}`)); }
};
import { Handler, Context, Callback } from 'aws-lambda';

export const online : Handler = (event: any, context: Context, callback: Callback) => {
    const response = {
        statusCode: 200,
        body: "Server online",
    };

    return callback(null, response);
};
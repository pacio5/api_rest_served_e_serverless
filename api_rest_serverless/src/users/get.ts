import { UserModel } from '../database/users/users.model';
import { auth } from "../authentication";
import { Handler, Context, Callback } from 'aws-lambda';

export const get : Handler = (event: any, context: Context, callback: Callback) => {
    const result = auth(event);
    if(!result) callback(new Error("unauthenticated user "));

    const data = JSON.parse(event.body);
    UserModel.findOne({ _id: data.decoded.id }, (err, user) => {
        if (!user) callback(new Error("no such user found"));
        const response = {
            status: 200,
            user: user
        };

        return callback(null, response);
      });
};
import { UserModel } from '../database/users/users.model';
import { auth } from "../authentication";
import { Handler, Context, Callback } from 'aws-lambda';

export const del : Handler = (event: any, context: Context, callback: Callback) => {
    const result = auth(event);
    if(!result) callback(new Error("unauthenticated user "));

    const data = JSON.parse(event.body);
    UserModel.remove({ _id: data.decoded.id }, (err) => {
        if (err) callback(new Error("delete error, try again"));
        const response = {
            status: 200,
            body: "user deleted"
        };

        return callback(null, response);
      });
};
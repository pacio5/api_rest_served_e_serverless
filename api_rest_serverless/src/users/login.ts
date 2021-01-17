import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from '../database/users/users.model';
import { Handler, Context, Callback } from 'aws-lambda';


export const login : Handler = (event: any, context: Context, callback: Callback) => {
    const secretKey = 'secretkey'
    const data = JSON.parse(event.body);
    if(!data) return callback(new Error('Couldn\'t create the todo item.'));

    UserModel.findOne({ _id: data.email }, (err, userFind) => {
        if (!userFind) callback(new Error("incorrect email or password"));
        
        if (!bcrypt.compareSync(data.password, userFind.password))
            callback(new Error("incorrect email or password"));
            
        const token = jwt.sign({ id: userFind._id }, secretKey, { expiresIn: '1h' });
        const response = {
            status: 200,
            body: 'user logged',
            token: token
        };

        return callback(null, response);
    });
};
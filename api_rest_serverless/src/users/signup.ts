import bcrypt from 'bcryptjs';
import { UserModel } from '../database/users/users.model';
import { Handler, Context, Callback } from 'aws-lambda';
import querystring from 'querystring';
import { connect, disconnect } from "../database/database";

export const signup: Handler = async (event: any, context: Context, callback: Callback) => {
  let data = querystring.parse(event.body);
  if (!data) return callback(new Error('Couldn\'t create the todo item.'));
  
  const user = { _id: data.email.toString(), password: bcrypt.hashSync(data.password.toString(), bcrypt.genSaltSync(5)) };
  
  try {
    connect();
    const userFind = await UserModel.findById(user._id);
    if (userFind) {
      return callback(null, { status: 401, body: "User exists"});
    } else {
      const newUser = await UserModel.create(user);

      if (Object.is(newUser, null)) {
        return callback(null, { status: 401, body: "Errore nella creazione" });
      } else return callback(null, { status: 200, body: "User created" });
    }
  } catch (err) {
    return callback(null, err);
  } finally {
    disconnect();
  }
};
import bcrypt from 'bcryptjs';
import { UserModel } from '../database/users/users.model';
import { Handler, Context, Callback } from 'aws-lambda';


export const signup : Handler = (event: any, context: Context, callback: Callback) => {
    const data = JSON.parse(event.body);

    if(!data) return callback(new Error('Couldn\'t create the todo item.'));

    let user = { _id: data.email, password: bcrypt.hashSync(data.password, bcrypt.genSaltSync(5)) };

    (async () => {
        try {
          const newUser = await UserModel.findOneOrCreate(user);
          if (Object.is(newUser, null)) {
            return callback(new Error('User exists'))
          } else {
            const response = {
                status: 200,
                body: `Created user ${user._id}`
            }
            return callback(null, response);
          }
        } catch (err) {
            return callback(`error ${err}`)
        }
      })();
};
  
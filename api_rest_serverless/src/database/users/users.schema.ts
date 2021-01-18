import * as Mongoose from "mongoose";

const UserSchema = new Mongoose.Schema({
  _id: String,
  password: String,
});

export default UserSchema;


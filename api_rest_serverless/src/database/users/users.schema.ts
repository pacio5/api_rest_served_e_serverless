import * as Mongoose from "mongoose";
import { findOneOrCreate } from "./users.statics";

const UserSchema = new Mongoose.Schema({
  _id: String,
  password: String,
});

//UserSchema.statics.findOneOrCreate = findOneOrCreate;


export default UserSchema;

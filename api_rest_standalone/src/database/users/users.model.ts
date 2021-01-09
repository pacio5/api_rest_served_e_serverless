import * as Mongoose from "mongoose";
import UserSchema from "./users.schema";
import { IUser, IUserModel } from "./users.types";

export const UserModel = Mongoose.model<IUser>(
  "user",
  UserSchema
) as IUserModel;

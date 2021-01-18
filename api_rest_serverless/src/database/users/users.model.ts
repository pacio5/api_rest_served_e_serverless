import * as Mongoose from "mongoose";
import UserSchema from "./users.schema";
import { IUser } from "./users.types";

export const UserModel = Mongoose.model<IUser>("user", UserSchema);
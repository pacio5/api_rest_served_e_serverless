import { Document, Model } from "mongoose";

export interface IUser extends Document<any>{
  _id: string;
  password: string;
}
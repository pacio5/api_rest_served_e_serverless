import { Document, Model } from "mongoose";

export interface IUser extends Document{
  _id: string;
  password: string;
}

export interface IUserModel extends Model<IUser> {
  findOneOrCreate: (
    this: IUserModel,
    {
      _id,
      password,
      
    }: { _id: string; password: string; }
  ) => Promise<IUser>;
}

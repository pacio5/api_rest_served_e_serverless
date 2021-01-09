import { IUser, IUserModel } from "./users.types";

export async function findOneOrCreate(
  this: IUserModel,
  {
    _id,
    password,
  }: { _id: string; password: string; }
): Promise<IUser> {
  const record = await this.findOne({ _id});
  if (record) {
    return null;
  } else {
    return this.create({ _id, password });
  }
}


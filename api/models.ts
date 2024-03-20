import mongoose, { Document, Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";

interface IMongooseArray<T> extends Types.Array<T> {
  pull(...args: any[]): this;
}
export interface IUser extends Document {
  name: string;
  handle: string;
  profilePicture: string;
  password: string;
  friends: IMongooseArray<Types.ObjectId>;
  friendRequests: IMongooseArray<Types.ObjectId>;
  toJSON(): any;
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, index: true, required: true },
  handle: { type: String, required: true, unique: true, index: true },
  profilePicture: { type: String },
  password: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  const user = this;
  return user.password === candidatePassword;
};
UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      profilePicture: this.profilePicture,
      handle: this.handle,
    },
    process.env.JWT_PRIVATE_KEY || ""
  );
  return token;
};
const User = mongoose.model<IUser>("User", UserSchema);

export { User };

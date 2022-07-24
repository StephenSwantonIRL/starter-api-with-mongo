import Mongoose from "mongoose";

const { Schema } = Mongoose;

const tokenSchema = new Schema({
  token: String,
  revokedAt: { type: Date, default: Date.now },
});

export const Token = Mongoose.model("Token", tokenSchema);

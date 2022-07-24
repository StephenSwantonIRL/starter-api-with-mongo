import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {MongoStore} from "../src/models/mongo/stores.js";

async function checkToken(token)
  {
    const tokenToCheck = await MongoStore.getByProperty(token,"token","Token");
    if (tokenToCheck) {
      return "revoked";
    }
    return "ok";

}


const result = dotenv.config();

export function createToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
  };
  return jwt.sign(payload, process.env.cookie_password, options);
}

export function decodeToken(token) {
  const userInfo = {};
  try {
    const decoded = jwt.verify(token, process.env.cookie_password);
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
  } catch (e) {
    console.log(e.message);
  }
  return userInfo;
}

export async function validate(decoded, request) {
  const token = await checkToken(request.auth.token);
  if (token !== "ok") {
    return { isValid: false };
  }
  const user = await MongoStore.getByProperty(decoded.id, "_id", "User");
  if (!user) {
    return { isValid: false };
  }
  return { isValid: true, credentials: user };
}
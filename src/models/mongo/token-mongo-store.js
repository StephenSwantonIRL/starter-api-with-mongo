import { Token } from "./revokedToken.js";

export const tokenMongoStore = {


  async addRevokedToken(tokenToAdd) {
    try {
      const token = new Token(tokenToAdd);
      const tokenObj = await token.save();
      const t = await this.checkToken(tokenObj._id);
      return t;
    } catch (e) {
      return new Error("Revoke Failed");
    }

  },

  async checkToken(token) {
    const tokenToCheck = await Token.findOne({ token: token }).lean();
    if (tokenToCheck) {
      return "revoked";
    }
    return "ok";
  },
};

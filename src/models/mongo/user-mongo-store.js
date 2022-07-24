import { User } from "./user.js";
import bcrypt from "bcrypt";
import { db } from "../db.js";

export const userMongoStore = {
  async getAllUsers() {
    const users = await User.find().lean();
    return users;
  },

  async getUserById(id) {
    if (id) {
      const user = await User.findOne({ _id: id }).lean();
      return user;
    }
    return null;
  },

  async addUser(user) {
    const userInDb = await this.getUserByEmail(user.email);
    if (!user.firstName || !user.lastName || !user.email || !user.password) {
      return new Error("Incomplete User Information");
    } else if (userInDb === null) {
      user.isAdmin = false;
      const newUser = new User(user);
      const userObj = await newUser.save();
      const u = await this.getUserById(userObj._id);
      return u;
    } else {
      // eslint-disable-next-line no-throw-literal
      return new Error("User Already Exists");
    }
  },

  async getUserByEmail(email) {
    const user = await User.findOne({ email: email }).lean();
    return user;
  },

  async getUserByGitHub(id) {
    const user = await User.findOne({ gitHub: id }).lean();
    return user;
  },

  async deleteUserById(id) {
    try {
      await User.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAll() {
    await User.deleteMany({});
  },

  async updateUser(userId, updatedUser) {
    const user = await this.getUserById(userId);
    const emailCheck = await this.getUserByEmail(updatedUser.email);
    if (user !== null && (emailCheck === null || user.email === updatedUser.email)) {
      await User.updateOne(
        { _id: userId },
        {
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          password: updatedUser.password,
        }
      );
    } else if (emailCheck !== null) {
      return Promise.reject(Error("Another user is already using that email address"));
    } else {
      return Promise.reject(Error("User does not exist"));
    }
  },

  async checkAdmin(id) {
    if (id) {
      const user = await User.findOne({ _id: id }).lean();
      return user.isAdmin;
    }
    return null;
  },

  async makeAdmin(id) {
    if (id) {
      await User.updateOne({ _id: id }, { isAdmin: true });
      const outcome = await this.getUserById(id)
      return outcome.isAdmin
    }
    return Promise.reject(Error("User does not exist"));
  },

  async revokeAdmin(id) {
    if (id) {
      await User.updateOne({ _id: id }, { isAdmin: false });
      const outcome = await this.getUserById(id)
      return outcome.isAdmin
    }
    return Promise.reject(Error("User does not exist"));
  },
};

import Boom from "@hapi/boom";
import bcrypt from "bcrypt";
import Joi from "joi";
import { createToken } from "./jwt-utils.js";
import { db } from "../src/models/db.js";
import { UserArray, UserSpec, UserCredentialsSpec, UserSpecPlus, IdSpec, JwtAuth } from "../src/models/joi-schemas.js";
import { validationError } from "./logger.js";
import { tokenMongoStore } from "../src/models/mongo/token-mongo-store.js";

const saltRounds = 10;

export const userApi = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        const users = await db.userStore.getAllUsers();
        return users;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all userApi",
    notes: "Returns details of all userApi",
    response: { schema: UserArray, failAction: validationError },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        const user = await db.userStore.getUserById(request.params.id);
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        return user;
      } catch (err) {
        return Boom.serverUnavailable("No User with this id");
      }
    },
    tags: ["api"],
    description: "Get a User by ID",
    notes: "Returns details of a single user identified by their ID number",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  findOneByEmail: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        const user = await db.userStore.getUserByEmail(request.payload.email);
        if (!user) {
          return Boom.notFound("No User with this email");
        }
        return user;
      } catch (err) {
        return Boom.serverUnavailable("No User with this email");
      }
    },
    tags: ["api"],
    description: "Get a User by Email",
    notes: "Returns details of a single user identified by their Email",
    validate: { payload: Joi.object().keys({ email: Joi.string().email() }), failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  create: {
    auth: false,
    handler: async function(request, h) {
      try {
        const userDetails = request.payload;
        userDetails.password = await bcrypt.hash(userDetails.password, saltRounds);
        const user = await db.userStore.addUser(userDetails);
        if (user) {
          return h.response(user).code(201);
        }
        return Boom.badImplementation("error creating user");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a new User",
    notes: "Adds a new user to the database.",
    validate: { payload: UserSpec, failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  deleteAll: {
    auth: false,
    handler: async function(request, h) {
      try {
        await db.userStore.deleteAll();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Deletes all users",
    notes: "Deletes all users from the database.",
  },

  authenticate: {
    auth: false,
    handler: async function(request, h) {
      try {
        const user = await db.userStore.getUserByEmail(request.payload.email);
        if (user) {
          const passwordsMatch = await bcrypt.compare(request.payload.password, user.password);
          if (passwordsMatch) {
            const token = createToken(user);
            return h.response({ success: true, token: token }).code(201);
          }
          return Boom.unauthorized("Invalid password");
        }
        return Boom.unauthorized("User not found");

      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Authenticate a User",
    notes: "If user has valid email/password, create and return a JWT token",
    validate: { payload: UserCredentialsSpec, failAction: validationError },
    response: { schema: JwtAuth, failAction: validationError },
  },

  revokeToken: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      const response = await tokenMongoStore.addRevokedToken({ token: request.auth.artifacts.token });
      if (response) {
        return h.response(response).code(201);
      }
      return Boom.badImplementation("error revoking token");
    },
  },

  checkToken: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      return h.response("ok").code(200);
    },
  },

  githubAuth: {
    auth: {
      strategy: "github-oauth",
    },
    handler: async function(request, h) {
      if (!request.auth.isAuthenticated) {
        return `Authentication failed due to: ${request.auth.error.message}`;
      }
      if (request.auth.isAuthenticated) {
        const user = await db.userStore.getUserByGitHub(request.auth.credentials.profile.username);
        if (!user) {
          const [firstname, ...lastname] = (request.auth.credentials.profile.displayName).split(" ");
          const gitHubUser = {
            firstName: firstname,
            lastName: lastname.join(" "),
            email: request.auth.credentials.profile.email,
            gitHub: request.auth.credentials.profile.username,
          };
          const string = new Buffer(JSON.stringify(gitHubUser)).toString("base64")
          const convertedString = new Buffer(string, "base64").toString("ascii")
          return h.redirect(`${process.env.frontEndDomain}/#/github/${ string}`)
        }
        const token = createToken(user);
        return h.redirect(`${process.env.frontEndDomain}/#/auth/${user._id}/${token}`);
      }
    },
  },
  
};
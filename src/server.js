import Vision from "@hapi/vision";
import Hapi from "@hapi/hapi";
import Cookie from "@hapi/cookie";
import Inert from "@hapi/inert";
import Bell from "@hapi/bell";
import dotenv from "dotenv";
import path from "path";
import Joi from "joi";
import jwt from "hapi-auth-jwt2";
import HapiSwagger from "hapi-swagger";
import { fileURLToPath } from "url";
import { validate } from "../api/jwt-utils.js";
import { apiRoutes } from "./api-routes.js"
import {connectMongo} from "./models/mongo/connect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  //process.exit(1);
}

const swaggerOptions = {
  info: {
    title: "PlaceMark API",
    version: "0.1",
  },
  securityDefinitions: {
    jwt: {
      type: "apiKey",
      name: "Authorization",
      in: "header"
    }
  },
  security: [{ jwt: [] }]
};


async function init() {
  const server = Hapi.server({
    port: process.env.PORT || 4000,
    routes: { cors: true }
  });

  await server.register(Vision);
  await server.register(Cookie);
  await server.register(Inert);
  await server.register(Bell)
  await server.register(jwt);
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);
  server.validator(Joi);

  server.auth.strategy("jwt", "jwt", {
    key: process.env.cookie_password,
    validate: validate,
    verifyOptions: { algorithms: ["HS256"] },
  });

  const bellAuthOptions = {
    provider: "github",
    password: process.env.cookie_password,
    clientId: process.env.githubclientid,
    clientSecret: process.env.githubclientsecret,
    location: process.env.domain,
    isSecure: false
  };
  server.auth.strategy("github-oauth", "bell", bellAuthOptions);

  server.auth.default("jwt");

  connectMongo();
  server.route(apiRoutes);
  await server.start();
  console.log("Server running on %s", server.info.uri);
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();

import Boom from "@hapi/boom";
import _ from "lodash";
import { db } from "../src/models/db.js";
import {
  CategoryArray,
  CategorySpecPlus,
  IdSpec,
  CategorySpec,
  PlaceArray,
  PlaceIdSpec,
} from "../src/models/joi-schemas.js";
import { validationError} from "./logger.js";

export const categoryApi = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        const categories = await db.categoryStore.getAllCategories();
        return categories;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }

    },
    tags: ["api"],
    description: "Get all Categories",
    notes: "Returns details of all Categories",
    response: { schema: CategoryArray, failAction: validationError }
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        const category = await db.categoryStore.getCategoryById(request.params.id);
        if (!category) {
          return Boom.notFound("No Category with this id");
        }
        return category;
      } catch (err) {
        return Boom.serverUnavailable("No Category with this id");
      }
    },
    tags: ["api"],
    description: "Gets details related to a Category",
    notes: "Returns details of a Category based on the ID provided",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: CategorySpecPlus, failAction: validationError }
  },

  create: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const category = request.payload;
        const newCategory = await db.categoryStore.addCategory(category);
        if (newCategory) {
          return h.response(newCategory).code(201);
        }
        return Boom.badImplementation("error creating category");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Creates a new Category",
    notes: "Adds a new category to the database",
    validate: { payload: CategorySpec, failAction: validationError },
    response: { schema: CategorySpecPlus, failAction: validationError }
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const category = await db.categoryStore.getCategoryById(request.params.id);
        if (!category) {
          return Boom.notFound("No Category with this id");
        }
        await db.categoryStore.deleteCategoryById(category._id, true); // place holder of true for isAdmin untl
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("No Category with this id");
      }
    },
    tags: ["api"],
    description: "Deletes a category. ",
    notes: "Deletes a category based on the category ID provided",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        await db.categoryStore.deleteAll();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Deletes all categories. ",
    notes: "Deletes all categories from the database",
  },

  getPlaces: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        const places = await db.categoryStore.getPlaces(request.params.id);
        return places;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }

    },
    tags: ["api"],
    description: "Get Places tagged with Category",
    notes: "Returns details of places tagged with a Category",
    response: { schema: PlaceArray, failAction: validationError }
  },

  removePlace: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const category = await db.categoryStore.getCategoryById(request.params.categoryId);
        if (!category) {
          return Boom.notFound("No Category with this id");
        }
        const {places} = category
        const placesArray = _.clone(places).map((object) => object.toString());
        if (placesArray.includes(request.params.placeId)) {
          await db.categoryStore.deletePlace(request.params.placeId, request.params.categoryId);
          return h.response().code(204);
        } else {
          return Boom.serverUnavailable("PlaceMark not tagged with this Category");
        }
      } catch (err) {
        return Boom.serverUnavailable("No Category with this id");
      }
    },
    tags: ["api"],
    description: "Deletes a place from a category. ",
    notes: "Deletes a place from a category based on the place and category ID provided",
    validate: { params: { placeId: IdSpec, categoryId: IdSpec }, failAction: validationError },
  },

  addPlace: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const newPlace = await db.categoryStore.addPlace(request.payload.placeId, request.params.categoryId);
        if (newPlace) {
          return h.response(newPlace).code(201);
        }
        return Boom.badImplementation("error adding Place");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Adds a place to a category",
    notes: "Adds a place to a category",
    validate: { payload: PlaceIdSpec, failAction: validationError },
    response: { schema: CategorySpecPlus, failAction: validationError }
  },

};

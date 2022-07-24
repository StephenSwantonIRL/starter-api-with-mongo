import Boom from "@hapi/boom";
import sanitizeHtml from "sanitize-html";
import { db } from "../src/models/db.js";
import {
  PlaceArray,
  PlaceSpecAPI,
  PlaceSpecPlus,
  PlaceSpecPlusWithCategoriesObject,
  IdSpec, PlaceSpecWithCategory, PlaceSpecWithCategoryAndId,
} from "../src/models/joi-schemas.js";
import { validationError } from "./logger.js";
import { imageStore } from "../src/models/image-store.js";

export const placeApi = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        const places = await db.placeStore.getAllPlaces();
        return places;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }

    },
    tags: ["api"],
    description: "Get all Places",
    notes: "Returns details of all Places",
    response: { schema: PlaceArray, failAction: validationError },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        const place = await db.placeStore.getPlaceById(request.params.id);
        if (!place) {
          return Boom.notFound("No PlaceMark with this id");
        }
        const returnedCategories = await db.categoryStore.getCategoriesByPlace(place._id);
        place.categories = returnedCategories;
        console.log(place);
        return place;
      } catch (err) {
        return Boom.serverUnavailable("No PlaceMark with this id");
      }
    },
    tags: ["api"],
    description: "Gets details related to a Place",
    notes: "Returns details of a Place based on the ID provided",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: PlaceSpecPlusWithCategoriesObject, failAction: validationError },
  },

  create: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        console.log(request.payload);
        const place = request.payload;
        if (request.payload.images) {
          const imageString = request.payload.images;
          const imageArray = imageString.split(",");
          imageArray.pop();
          place.images = imageArray;
        }
        if (request.payload.description) {
          place.description = sanitizeHtml(request.payload.description, {
              allowedTags: ["b", "i", "em", "ul", "li", "strong", "a"],
              allowedAttributes: {
                "a": ["href"],
              },
            },
          );
        }
        place.createdBy = request.auth.credentials._id;
        const newPlace = await db.placeStore.addPlace(place);

        let categories;
        if (request.payload.categories === "") {
          categories = [];
        } else {
          categories = request.payload.categories.split(",");
        }
        for (let i = 0; i < categories.length; i += 1) {

          const category = await db.categoryStore.getCategoryByName(categories[i]);
          console.log(category);
          await db.categoryStore.addPlace(newPlace._id, category._id);
        }
        const result = await db.placeStore.getPlaceById(newPlace._id);

        console.log(newPlace);
        if (newPlace) {
          return h.response(newPlace).code(201);
        }
        return Boom.badImplementation("error creating place");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Creates a new Place",
    notes: "Adds a new place to the database",
    validate: { payload: PlaceSpecWithCategory, failAction: validationError },
    response: { schema: PlaceSpecPlus, failAction: validationError },
  },

  saveEdited: {
    auth: {
      strategy: "jwt",
    },
    validate: {
      payload: PlaceSpecWithCategoryAndId,
      options: { abortEarly: false },
      failAction: function(request, h, error) {
        console.log(error.details);
        return Boom.badRequest("Invalid Query");
      },
    },
    response: { schema: PlaceSpecPlus, failAction: validationError },
    handler: async function(request, h) {
      const updatedPlace = request.payload;
      if (request.payload.images) {
        const imageString = request.payload.images;
        const imageArray = imageString.split(",");
        imageArray.pop();
        updatedPlace.images = imageArray;
      }
      if (request.payload.description) {
        updatedPlace.description = sanitizeHtml(request.payload.description, {
            allowedTags: ["b", "i", "em", "ul", "li", "strong", "a"],
            allowedAttributes: {
              "a": ["href"],
            },
          },
        );
      }
      updatedPlace.createdBy = request.auth.credentials._id;
      const updatePlace = await db.placeStore.updatePlace(request.params.id, updatedPlace);
      if (updatePlace.message) {
        const errorDetails = [{ message: updatePlace.message }];
        console.log(errorDetails);
        return Boom.badRequest("Invalid Query");
      }
      const originalCategories = await db.categoryStore.getCategoriesByPlace(request.params.id);
      if (originalCategories) {
        for (let i = 0; i < originalCategories.length; i += 1) {
          await db.categoryStore.deletePlace(request.params.id, originalCategories[i]._id);
        }
      }
      let categories;
      if (request.payload.categories === "") {
        categories = [];
      } else {
        categories = request.payload.categories.split(",");
      }
      for (let i = 0; i < categories.length; i += 1) {

        const category = await db.categoryStore.getCategoryByName(categories[i]);
        console.log(category);
        await db.categoryStore.addPlace(request.params.id, category._id);
      }
      const result = await db.placeStore.getPlaceById(updatedPlace._id);
      return result;
    },
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        const place = await db.placeStore.getPlaceById(request.params.id);
        console.log("returned place");
        console.log(place);
        if (!place) {
          return Boom.notFound("No PlaceMark with this id");
        }
        await db.placeStore.deletePlaceById(place._id, place.createdBy);
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("No PlaceMark with this id");
      }
    },
    tags: ["api"],
    description: "Deletes a place. ",
    notes: "Deletes a place based on the place ID provided and creating user id provided",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        await db.placeStore.deleteAll();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Deletes all places. ",
    notes: "Deletes all places from the database",
  },
  uploadImage: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        const file = request.payload.imagefile;
        if (Object.keys(file).length > 0) {
          const url = await imageStore.uploadImage(request.payload.imagefile);
          return { url: url };
        }
      } catch (err) {
        console.log(err);
        return Boom.badImplementation(err);
      }
      return Boom.badImplementation("Something went wrong.. :( ");
    },
    payload: {
      multipart: true,
      output: "data",
      maxBytes: 209715200,
      parse: true,
    },
  },


  deleteImage: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      try {
        const image = request.params.id;
        const action = await imageStore.deleteImage(image, {});
        console.log(action);
        return action;
      } catch (err) {
        console.log(err);
        return Boom.badImplementation(err);
      }
      return Boom.badImplementation(action);
    },
  },

};

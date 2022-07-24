import { userApi } from "../api/user-api.js"
import { placeApi } from "../api/place-api.js";
import { categoryApi } from "../api/category-api.js";

export const apiRoutes = [
  { method: "GET", path: "/api/users", config: userApi.find },
  { method: "POST", path: "/api/users", config: userApi.create },
  { method: "DELETE", path: "/api/users", config: userApi.deleteAll },
  { method: "GET", path: "/api/users/{id}", config: userApi.findOne },
  { method: "POST", path: "/api/users/find", config: userApi.findOneByEmail },
  { method: "POST", path: "/api/users/authenticate", config: userApi.authenticate },

  { method: "POST", path: "/api/placemark", config: placeApi.create },
  { method: "DELETE", path: "/api/placemark", config: placeApi.deleteAll },
  { method: "GET", path: "/api/placemark", config: placeApi.find },
  { method: "GET", path: "/api/placemark/{id}", config: placeApi.findOne },
  { method: "POST", path: "/api/placemark/{id}", config: placeApi.saveEdited },
  { method: "DELETE", path: "/api/placemark/{id}", config: placeApi.deleteOne },
  { method: "POST", path: "/api/place/uploadimage", config: placeApi.uploadImage },
  { method: "DELETE", path: "/api/place/deleteimage/{id}", config: placeApi.deleteImage },

  { method: "POST", path: "/api/placemark/category", config: categoryApi.create },
  { method: "DELETE", path: "/api/placemark/category", config: categoryApi.deleteAll },
  { method: "GET", path: "/api/placemark/category", config: categoryApi.find },
  { method: "GET", path: "/api/placemark/category/{id}", config: categoryApi.findOne },
  { method: "DELETE", path: "/api/placemark/category/{id}", config: categoryApi.deleteOne },
  { method: "POST", path: "/api/placemark/category/{categoryId}/places", config: categoryApi.addPlace },
  { method: "DELETE", path: "/api/placemark/category/{categoryId}/places/{placeId}", config: categoryApi.removePlace },
  { method: "GET", path: "/api/placemark/category/{id}/places", config: categoryApi.getPlaces },

  { method: "POST", path: "/api/revokeToken", config: userApi.revokeToken },
  { method: ["GET", "POST","DELETE"], path: "/api/checkToken", config: userApi.checkToken },
  { method: "GET", path: "/github", config: userApi.githubAuth },
  { method: ["GET", "POST"], path: "/auth", config: userApi.githubAuth },

];
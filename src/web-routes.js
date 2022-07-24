import { aboutController } from "./controllers/about-controller.js";
import { accountsController } from "./controllers/accounts-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { placeController } from "./controllers/placemark-controller.js";

export const webRoutes = [
  { method: "GET", path: "/", config: accountsController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "GET", path: "/logout", config: accountsController.logout },
  { method: "POST", path: "/register", config: accountsController.signup },
  { method: "POST", path: "/authenticate", config: accountsController.login },
  { method: "POST", path: "/updateUser", config: accountsController.update },
  { method: "GET", path: "/editAccount", config: accountsController.edit },

  { method: "GET", path: "/addPlace", config: placeController.add },
  { method: "GET", path: "/editPlace/{id}", config: placeController.edit },
  { method: "POST", path: "/editPlace/{id}", config: placeController.saveEdited },
  { method: "GET", path: "/deletePlace/{id}", config: placeController.delete },
  { method: "POST", path: "/addPlace", config: placeController.save },
  { method: "GET", path: "/getPlace/{id}", config: placeController.findOne },
  { method: "POST", path: "/place/uploadimage", config: placeController.uploadImage },
  { method: "GET", path: "/place/{id}/categorise/{categoryid}", config: placeController.categorise },


  { method: "GET", path: "/about", config: aboutController.index },

  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "GET", path: "/admin", config: dashboardController.admin },
  { method: "GET", path: "/makeAdmin/{id}", config: dashboardController.makeAdmin },
  { method: "GET", path: "/revokeAdmin/{id}", config: dashboardController.revokeAdmin },
  { method: "GET", path: "/deleteUser/{id}", config: dashboardController.deleteUser },
  { method: "GET", path: "/category/{id}", config: placeController.viewByCategory },
  { method: "POST", path: "/addCategory", config: dashboardController.addCategory },
  { method: "GET", path: "/deleteCategory/{id}", config: dashboardController.deleteCategory },
  { method: "POST", path: "/editCategory/{id}", config: dashboardController.editCategory },
  { method: "GET", path: "/{param*}", handler: { directory: { path: "../public" } }, options: { auth: false } }
];

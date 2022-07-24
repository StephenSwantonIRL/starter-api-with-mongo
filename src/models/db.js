import { userMongoStore} from "./mongo/user-mongo-store.js";
import { placeMongoStore } from "./mongo/place-mongo-store.js";
import { categoryMongoStore } from "./mongo/category-mongo-storeB.js";
import { connectMongo } from "./mongo/connect.js";

export const db = {
  userStore: null,
  placeStore: null,
  categoryStore: null,

  init(storeType) {
    switch (storeType) {
      case "mongo" :
        this.userStore = userMongoStore;
        this.placeStore = placeMongoStore;
        this.categoryStore = categoryMongoStore;
        connectMongo();
        break;
      default :
        this.userStore = userMongoStore;
        this.placeStore = placeMongoStore;
        this.categoryStore = categoryMongoStore;
    }
  }
};

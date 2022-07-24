/* eslint-disable no-else-return */
import _ from "lodash";
// import all mongo schemas
import { User } from "./user.js";
import { Token } from "./revokedToken.js";
//

const stores = new Map();

stores.set("User", User )
stores.set("Token", Token)

function selectStore(Store){
  return stores.get(Store);
}


export const MongoStore = {
  async getAll(store) {
    const Store = selectStore(store);
    const results = await Store.find().lean();
    return results;
  },

  async getByProperty(value, property, store) {
    if (value) {
      const Store = selectStore(store);
      const result = await Store.findOne({ [property]: value }).lean();
      return result;
    }
    return null;
  },

  async addOne(object, store) {
    const Store = selectStore(store);
    const operation = new Store(object);
    console.log(operation);
    await operation.save();
    const newObject =  await this.getByProperty(operation._id, "_id", store);
    return newObject;
  },

  async addToProperty(value, property, parentObjectId, store) {
    if (!value || !parentObjectId || !property) {
      return new Error("Incomplete information provided");
    } else {
      const parentObject = await this.getByProperty(parentObjectId, "_id", store);
      const subObject = await this.getByProperty(value, "_id", store);
      if (parentObject === null || subObject === null) {
        return new Error("Unable to find Object. Check values for parent and sub objects");
      } else {
        const Store = selectStore(store);
        await Store.updateOne({ _id: parentObjectId }, { $push: { [property] : value } });
        const outcome = await this.getByProperty(parentObjectId);
        return outcome;
      }
    }
  },

  async updateOne( updatedObject, objectId, store) {
    const Store = selectStore(store)
    await Store.updateOne(
      { _id: objectId },
        updatedObject,
    );
    const outcome = await this.getByProperty(objectId);
    return outcome;
  },

  async getReferencedProperty(property, parentObjectId, parentStore, propertyObjectStore) {
    const ParentStore= selectStore(parentStore);
    const result = await ParentStore.find({ _id: parentObjectId }).lean();
    const p = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < result[0][property].length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const subObject = await this.getByProperty(result[0][property][i], "_id", propertyObjectStore);
      p.push(subObject);
    }
    return p;
  },


  async getByValueInNestedArray(value, property, store) {
    const Store = selectStore(store);
    const returnedParentObjects = await Store.find({ [property]: { $in: [value] } }).lean();
    return returnedParentObjects;
  },

  async deleteValueFromNestedArray(value, property, parentObjectId, store) {
    if (!value || !parentObjectId || !property || !store ) {
      return new Error("Incomplete information provided");
    } else {
      const parentObject = await this.getByProperty(parentObjectId, "_id", store);
      if (parentObject === null) {
        return new Error("Unable to find Parent Object");
      } else {
        const Store = selectStore(store)
        await Store.updateOne({ _id: parentObjectId }, { $pull: { [property]: { $in: value } } });
        const updatedObject = await this.getByProperty(parentObjectId, "_id", store);
        return updatedObject;
      }
    }
  },

  async deleteByProperty(value, property, store) {
    const object = await this.getByProperty(value, property, store);

    if (object !== null) {
      try {
        const Store = selectStore(store)
        await Store.deleteOne({ [property]: value });
        return Promise.resolve();
      } catch (error) {
        return new Error("Delete Failed.");
      }
    } else {
      return new Error("Unable to complete request. Object doesn't Exist");
    }
  },

  async deleteAll(store) {
    const Store = selectStore(store);
    await Store.deleteMany({});
  },
};

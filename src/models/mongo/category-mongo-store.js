/* eslint-disable no-else-return */
import _ from "lodash";
import { Category } from "./category.js";
import { placeMongoStore } from "./place-mongo-store.js";


export const categoryMongoStore = {
  async getAllCategories() {
    const categories = await Category.find().lean();
    return categories;
  },

  async getCategoryById(id) {
    if (id) {
      const category = await Category.findOne({ _id: id }).lean();
      return category;
    }
    return null;
  },

  async addCategory(category) {
    const newCategory = {};
    newCategory.name = category.name;
    const operation = new Category(newCategory);
    const returnedCategory = await operation.save();
    return this.getCategoryById(returnedCategory._id);
  },

  async addPlace(id, categoryId) {
    if (!id || !categoryId) {
      return new Error("Incomplete information provided");
    } else {
      const category = await this.getCategoryById(categoryId);
      const place = await placeMongoStore.getPlaceById(id);
      if (category === null || place === null) {
        return new Error("Unable to find Category or Place");
      } else {
        await Category.updateOne({ _id: categoryId }, { $push: { places: id } });
        const outcome = await this.getCategoryById(categoryId);
        return outcome;
      }
    }
  },

  async updateCategory(id, updatedCategory) {
    await Category.updateOne(
      { _id: id },
      {
        name: updatedCategory.name,
      }
    );
    const outcome = await this.getCategoryById(id);
    return outcome;
  },

  async getPlaces(id) {
    const category = await Category.find({ _id: id }).lean();
    const p = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < category[0].places.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const pl = await placeMongoStore.getPlaceById(category[0].places[i]);
      p.push(pl);
    }
    return p;
  },

  async getCategoryByName(name) {
    const category = await Category.findOne({ name: name }).lean();
    return category;
  },

  async getCategoriesByPlace(placeId) {
    const returnedCategories = await Category.find({ places: { $in: [placeId] } }).lean();
    const clone = _.cloneDeep(returnedCategories);
    console.log(clone);
    for (let i = 0; i < clone.length; i += 1) {
      delete clone[i].places;
    }
    return clone;
  },

  async deletePlace(placeId, categoryId) {
    if (!placeId || !categoryId) {
      return new Error("Incomplete information provided");
    } else {
      const category = await this.getCategoryById(categoryId);
      if (category === null) {
        return new Error("Unable to find Category");
      } else {
        await Category.updateOne({ _id: categoryId }, { $pull: { places: { $in: placeId } } });
        const updatedCategory = await this.getCategoryById(categoryId);
        return updatedCategory;
      }
    }
  },

  async deleteCategoryById(id, isAdmin) {
    const categoryInDb = await this.getCategoryById(id);
    if (categoryInDb !== null && isAdmin === true) {
      try {
        await Category.deleteOne({ _id: id });
        return Promise.resolve();
      } catch (error) {
        return new Error("No Category with that Id");
      }
    } else {
      return new Error("Unable to complete request. Please ensure valid Category Id and Administrator");
    }
  },

  async deleteAll() {
    await Category.deleteMany({});
  },
};

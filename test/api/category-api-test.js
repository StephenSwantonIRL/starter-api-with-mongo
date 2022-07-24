import { assert } from "chai";
import { placeMarkService } from "./placemark-service.js";
import { db } from "../../src/models/db.js";
import { assertSubset } from "../test-utils.js";

import { svalbard, sealIsland, isolatedPlaces, maggie, maggieCredentials } from "../fixtures.js";

suite("Category API tests", () => {
  setup(async () => {
    db.init("fire");
    await placeMarkService.createUser(maggie);
    await placeMarkService.authenticate(maggieCredentials);
    await placeMarkService.deleteAllCategories();
  });

  teardown(async () => {});

  test("create category", async () => {
    const returnedCategory = await placeMarkService.createCategory(isolatedPlaces);
    assert.isNotNull(returnedCategory);
    assertSubset(isolatedPlaces, returnedCategory);
    await placeMarkService.deleteAllUsers();
  });

  test("return a category", async () => {
    const createdCategory = await placeMarkService.createCategory(isolatedPlaces);
    const returnedCategory = await placeMarkService.getCategory(createdCategory._id);
    assert.isNotNull(returnedCategory);
    assertSubset(isolatedPlaces, returnedCategory);
    await placeMarkService.deleteAllUsers();
  });

  test("attempt to return a non-existent category", async () => {
    try {
      const returnedCategory = await placeMarkService.getCategory("bad-id");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Category with this id", "Incorrect Response Message");
    }
    await placeMarkService.deleteAllUsers();
  });

  test("delete a category", async () => {
    const category = await placeMarkService.createCategory(isolatedPlaces);
    const response = await placeMarkService.deleteCategory(category._id);
    assert.equal(response.status, 204);
    try {
      const returnedCategory = await placeMarkService.getCategory(category._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Category with this id", "Incorrect Response Message");
    }
    await placeMarkService.deleteAllUsers();
  });

  test("add place to a category", async () => {
    const createdCategory = await placeMarkService.createCategory(isolatedPlaces);
    const returnedPlace = await placeMarkService.createPlace(svalbard);
    const returnedCategory = await placeMarkService.addPlaceToCategory(returnedPlace._id, createdCategory._id);
    assert.isNotNull(returnedCategory);
    assertSubset(isolatedPlaces, returnedCategory);
    await placeMarkService.deleteAllUsers();
  });

  test("get places in a category", async () => {
    const createdCategory = await placeMarkService.createCategory(isolatedPlaces);
    const places = [];
    assert.deepEqual(createdCategory.places, places);
    const placeOne = await placeMarkService.createPlace(svalbard);
    const placeTwo = await placeMarkService.createPlace(sealIsland);
    await placeMarkService.addPlaceToCategory(placeOne._id, createdCategory._id);
    await placeMarkService.addPlaceToCategory(placeTwo._id, createdCategory._id);
    const returnedPlaces = placeMarkService.getPlacesInCategory(createdCategory._id);
    assert.isNotNull(returnedPlaces);
    assertSubset(svalbard, returnedPlaces);
    assertSubset(sealIsland, returnedPlaces);
    await placeMarkService.deleteAllUsers();
  });

  test("delete place from a category", async () => {
    const createdCategory = await placeMarkService.createCategory(isolatedPlaces);
    const placeOne = await placeMarkService.createPlace(svalbard);
    const placeTwo = await placeMarkService.createPlace(sealIsland);
    await placeMarkService.addPlaceToCategory(placeOne._id, createdCategory._id);
    await placeMarkService.addPlaceToCategory(placeTwo._id, createdCategory._id);
    const returnedPlacesPre = await placeMarkService.getPlacesInCategory(createdCategory._id);
    assert.equal(returnedPlacesPre.length, 2);
    assertSubset(svalbard, returnedPlacesPre);
    await placeMarkService.deletePlaceFromCategory(placeOne._id, createdCategory._id);
    const returnedPlacesPost = await placeMarkService.getPlacesInCategory(createdCategory._id);
    assert.isFalse(assertSubset(svalbard, returnedPlacesPost));
    assertSubset(sealIsland, returnedPlacesPost);
    await placeMarkService.deleteAllUsers();
  });
});

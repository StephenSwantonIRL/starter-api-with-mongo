import { assert } from "chai";
import { placeMarkService } from "./placemark-service.js";
import { db } from "../../src/models/db.js";
import { assertSubset } from "../test-utils.js";

import { longplayer, svalbard, maggie, maggieCredentials } from "../fixtures.js";

suite("PlaceMark API tests", () => {
  let user = null;
  db.init("fire");
  setup(async () => {

    await placeMarkService.createUser(maggie);
    await placeMarkService.authenticate(maggieCredentials);
    await placeMarkService.deleteAllPlaces();
  });

  teardown(async () => {});

  test("create place", async () => {
    const returnedPlace = await placeMarkService.createPlace(svalbard);
    assert.isNotNull(returnedPlace);
    assertSubset(svalbard, returnedPlace);
    await placeMarkService.deleteAllUsers();
  });

  test("return a place", async () => {
    const createdPlace = await placeMarkService.createPlace(svalbard);
    const returnedPlace = await placeMarkService.getPlace(createdPlace._id);
    assert.isNotNull(returnedPlace);
    assertSubset(svalbard, returnedPlace);
    await placeMarkService.deleteAllUsers();
  });

  test("attempt to return a non-existent place", async () => {
    try {
      const returnedPlace = await placeMarkService.getPlace("bad-id");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No PlaceMark with this id", "Incorrect Response Message");
    }
    await placeMarkService.deleteAllUsers();
  });

  test("delete a place", async () => {
    const place = await placeMarkService.createPlace(svalbard);
    const response = await placeMarkService.deletePlace(place._id, place.createdBy);
    assert.equal(response.status, 204);
    try {
      const returnedPlace = await placeMarkService.getPlace(place._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No PlaceMark with this id", "Incorrect Response Message");
    }
    await placeMarkService.deleteAllUsers();
  });
});

import { assert } from "chai";
import _ from "lodash";
import { db } from "../../src/models/db.js";
import { longplayer, svalbard, incompleteSvalbard, updatedSvalbard, sealIsland } from "../fixtures.js";
import { assertSubset, assertObjectinArray } from "../test-utils.js";

suite("Place Model tests", () => {
  setup(async () => {
    db.init("fire");
    await db.placeStore.deleteAll();
  });

  test("create a place", async () => {
    const allPlacesPre = await db.placeStore.getAllPlaces();
    assert.isFalse(assertSubset(svalbard, allPlacesPre));
    const newPlace = await db.placeStore.addPlace(svalbard);
    const allPlacesPost = await db.placeStore.getAllPlaces();
    assertSubset(svalbard, allPlacesPost);
    assert.notEqual(allPlacesPre, allPlacesPost);
    assert.equal(allPlacesPost.length, allPlacesPre.length + 1);
  });

  test("create a place - failed - missing required parameter ", async () => {
    await db.placeStore.addPlace(incompleteSvalbard);
    const allPlaces = await db.placeStore.getAllPlaces();
    assert.isFalse(allPlaces.includes(incompleteSvalbard));
  });

  test("delete a place - fail - bad id ", async () => {
    const allPlacesPre = await db.placeStore.getAllPlaces();
    await db.placeStore.deletePlaceById("622cdc48fd9cca364d1e344a", "622cdc48fd9cca364d1e344a");
    const allPlacesPost = await db.placeStore.getAllPlaces();
    assert.equal(allPlacesPre.length, allPlacesPost.length);
  });

  test("delete a place - fail - not created by current user", async () => {
    const placeToDelete = await db.placeStore.addPlace(svalbard);
    const placeId = placeToDelete._id;
    const allPlacesPre = await db.placeStore.getAllPlaces();
    const currentUser = "1234";
    await db.placeStore.deletePlaceById(placeId, currentUser);
    const allPlacesPost = await db.placeStore.getAllPlaces();
    assert.equal(allPlacesPre.length, allPlacesPost.length);
    const assertion = assertSubset(placeToDelete, allPlacesPost);
  });

  test("delete a place - success ", async () => {
    const placeToDelete = await db.placeStore.addPlace(svalbard);
    const allPlacesPre = await db.placeStore.getAllPlaces();
    const currentUserId = placeToDelete.createdBy;
    const outcome = await db.placeStore.deletePlaceById(placeToDelete._id, currentUserId);
    const allPlacesPost = await db.placeStore.getAllPlaces();
    assert.notEqual(allPlacesPre.length, allPlacesPost.length);
    assert.isFalse(assertSubset(svalbard, allPlacesPost));
  });

  test("update a place - success", async () => {
    const place = await db.placeStore.addPlace(svalbard);
    svalbard._id = place._id;
    const editor = place.createdBy;
    assertSubset(svalbard, place);
    const allPlaces = await db.placeStore.getAllPlaces();
    const updatedPlace = updatedSvalbard;
    updatedPlace._id = place._id;
    await db.placeStore.updatePlace(place._id, updatedPlace);
    const finalPlace = await db.placeStore.getPlaceById(place._id);
    const finalPlaces = await db.placeStore.getAllPlaces();
    assertSubset(updatedPlace, finalPlace);
    assert.equal(allPlaces.length, finalPlaces.length);
  });

  test("get all places created by a specific user", async () => {
    await db.placeStore.addPlace(longplayer);
    const placeOne = await db.placeStore.addPlace(svalbard);
    const placeTwo = await db.placeStore.addPlace(sealIsland);
    const allPlaces = await db.placeStore.getAllPlaces();
    const userId = svalbard.createdBy;
    const usersPlaces = await db.placeStore.getUserPlaces(userId);
    console.log(usersPlaces);
    assertSubset(svalbard, usersPlaces);
    assertSubset(sealIsland, usersPlaces);
    assert.isFalse(assertSubset(longplayer, usersPlaces));
  });
});

import _ from "lodash";
import { assert } from "chai";
import { assertSubset } from "../test-utils.js";
import { placeMarkService } from "./placemark-service.js";
import { maggie, testUsers, maggieCredentials } from "../fixtures.js";
import {connectMongo} from "../../src/models/mongo/connect.js";

const users = new Array(testUsers.length);

suite("User API tests", () => {
  setup(async () => {
    connectMongo()
    await placeMarkService.deleteAllUsers();
    await placeMarkService.createUser(maggie);
    await placeMarkService.authenticate(maggieCredentials);
    await placeMarkService.deleteAllUsers();
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      users[i] = await placeMarkService.createUser(testUsers[i]);
    }
    await placeMarkService.clearAuth();
  });

  test("create a user", async () => {
    const newUser = await placeMarkService.createUser(maggie);
    await placeMarkService.authenticate(maggieCredentials);
    assertSubset(maggie, newUser);
    assert.isDefined(newUser._id);
    await placeMarkService.deleteAllUsers();
  });

  test("delete all userApi", async () => {
    const newUser = await placeMarkService.createUser(maggie);
    await placeMarkService.authenticate(maggieCredentials);
    let returnedUsers = await placeMarkService.getAllUsers();
    assert.equal(returnedUsers.length, 4);
    await placeMarkService.deleteAllUsers();
    await placeMarkService.createUser(maggie);
    await placeMarkService.authenticate(maggieCredentials);
    returnedUsers = await placeMarkService.getAllUsers();
    assert.equal(returnedUsers.length, 1);
    await placeMarkService.deleteAllUsers();
  });

  test("get a user", async () => {
    const newUser = await placeMarkService.createUser(maggie);
    await placeMarkService.authenticate(maggieCredentials);
    const returnedUser = await placeMarkService.getUser(users[0]._id);
    assert.deepEqual(users[0], returnedUser);
    await placeMarkService.deleteAllUsers();
  });

  test("get a user by email", async () => {
    const newUser = await placeMarkService.createUser(maggie);
    await placeMarkService.authenticate(maggieCredentials);
    const returnedUser = await placeMarkService.getUserByEmail(users[0].email);
    assert.deepEqual(users[0], returnedUser);
    await placeMarkService.deleteAllUsers();
  });

  test("get a user - bad id", async () => {
    try {
      const newUser = await placeMarkService.createUser(maggie);
      await placeMarkService.authenticate(maggieCredentials);
      const returnedUser = await placeMarkService.getUser("1234");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
    }
    await placeMarkService.deleteAllUsers();
  });

  test("get a user - deleted user", async () => {
    const newUser = await placeMarkService.createUser(maggie);
    await placeMarkService.authenticate(maggieCredentials);
    await placeMarkService.deleteAllUsers();
    try {
      await placeMarkService.createUser(maggie);
      await placeMarkService.authenticate(maggieCredentials);
      const returnedUser = await placeMarkService.getUser(testUsers[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
    }
    await placeMarkService.deleteAllUsers();
  });
});

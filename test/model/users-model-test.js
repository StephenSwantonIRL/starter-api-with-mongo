import chai, { assert, expect } from "chai";

import chaiAsPromised from "chai-as-promised";
import _ from "lodash";
import { MongoStore} from "../../src/models/mongo/stores.js";
import { maggie, updatedMaggie, suzie, testUsers } from "../fixtures.js";
import { assertSubset } from "../test-utils.js";
import { connectMongo} from "../../src/models/mongo/connect.js";

chai.use(chaiAsPromised);

suite("User Model tests", () => {
  setup(async () => {
    connectMongo()
    await MongoStore.deleteAll("User");
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testUsers[i] = await MongoStore.addOne(testUsers[i],"User");
    }
  });

  test("get all users ", async () => {
    const returnedUsers = await MongoStore.getAll("User");
    console.log(returnedUsers);
    assert.equal(returnedUsers.length, 3);
  });

  test("create a user - successful ", async () => {
    await MongoStore.deleteAll("User");
    const newUser = await MongoStore.addOne(maggie, "User");
    console.log(newUser);
    assertSubset(maggie, newUser);
  });

  test("create a user - failed - missing parameter ", async () => {
    const newUser = await MongoStore.addOne(suzie, "User");
    assert.isFalse(assertSubset(suzie, newUser));
  });

  test("create a user - failed email already exists", async () => {
    const user = await MongoStore.addOne(maggie, "User");
    const newUser = await MongoStore.addOne(maggie, "User");
    assert.equal(newUser.message, "User Already Exists");
  });

  test("delete all userApi", async () => {
    let returnedUsers = await MongoStore.getAll("User");
    assert.equal(returnedUsers.length, 3);
    await MongoStore.deleteAll("User");
    returnedUsers = await MongoStore.getAll("User");
    assert.equal(returnedUsers.length, 0);
  });

  test("get a user - success", async () => {
    const user = await MongoStore.addOne(maggie);
    const returnedUser1 = await MongoStore.getByProperty(user._id, "_id", "User");
    assert.deepEqual(user, returnedUser1);
    const returnedUser2 = await MongoStore.getByProperty(user.email, "email", "User");
    assert.deepEqual(user, returnedUser2);
  });

  test("delete One User - success", async () => {
    await MongoStore.deleteByProperty(testUsers[0]._id, "_id", "User");
    const returnedUsers = await MongoStore.getAll("User");
    assert.equal(returnedUsers.length, testUsers.length - 1);
    const deletedUser = await MongoStore.getByProperty(testUsers[0]._id, "_id", "User");
    assert.isNull(deletedUser);
  });


  test("delete One User - fail", async () => {
    const allUsersPreTest = await _.clone(MongoStore.getAll("User"));
    await MongoStore.deleteByProperty("bad-id", "_id", "User");
    const allUsersPostTest = await _.clone(MongoStore.getAll("User"));
    assert.equal(allUsersPreTest.length, allUsersPostTest.length);
  });

  test("update a user - success", async () => {
    const user = await MongoStore.addOne(maggie, "User");
    maggie._id = user._id;
    assertSubset(maggie, user);
    const updatedUser = updatedMaggie;
    updatedUser._id = user._id;
    updatedUser.isAdmin = false;
    await MongoStore.updateOne( updatedUser, user._id, "User");
    const finalUser = await MongoStore.getByProperty(user._id, "_id", "User");
    assertSubset(updatedUser, finalUser);
  });

  test("update a user - fail - another user with same email", async () => {
    const user = await MongoStore.addOne(maggie, "User");
    const updatedUser = updatedMaggie;
    updatedUser.email = "bart@simpson2.com";
    updatedUser._id = user._id;
    updatedUser.isAdmin = false;
    const outcome = await expect(MongoStore.updateOne( updatedUser, user._id,"User")).to.be.rejectedWith("Another user is already using that email address");
    console.log(outcome);
  });
});

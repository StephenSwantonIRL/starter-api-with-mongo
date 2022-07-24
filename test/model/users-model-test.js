import chai, { assert, expect } from "chai";

import chaiAsPromised from "chai-as-promised";
import _ from "lodash";
import { db } from "../../src/models/db.js";
import { maggie, updatedMaggie, suzie, testUsers } from "../fixtures.js";
import { assertSubset } from "../test-utils.js";

chai.use(chaiAsPromised);

suite("User Model tests", () => {
  setup(async () => {
    db.init("fire");
    await db.userStore.deleteAll();
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testUsers[i] = await db.userStore.addUser(testUsers[i]);
    }
  });

  test("get all users ", async () => {
    const returnedUsers = await db.userStore.getAllUsers();
    console.log(returnedUsers);
    assert.equal(returnedUsers.length, 3);
  });

  test("create a user - successful ", async () => {
    await db.userStore.deleteAll();
    const newUser = await db.userStore.addUser(maggie);
    console.log(newUser);
    assertSubset(maggie, newUser);
  });

  test("create a user - failed - missing parameter ", async () => {
    const newUser = await db.userStore.addUser(suzie);
    assert.isFalse(assertSubset(suzie, newUser));
  });

  test("create a user - failed email already exists", async () => {
    const user = await db.userStore.addUser(maggie);
    const newUser = await db.userStore.addUser(maggie);
    assert.equal(newUser.message, "User Already Exists");
  });

  test("delete all userApi", async () => {
    let returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, 3);
    await db.userStore.deleteAll();
    returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, 0);
  });

  test("get a user - success", async () => {
    const user = await db.userStore.addUser(maggie);
    const returnedUser1 = await db.userStore.getUserById(user._id);
    assert.deepEqual(user, returnedUser1);
    const returnedUser2 = await db.userStore.getUserByEmail(user.email);
    assert.deepEqual(user, returnedUser2);
  });

  test("delete One User - success", async () => {
    await db.userStore.deleteUserById(testUsers[0]._id);
    const returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, testUsers.length - 1);
    const deletedUser = await db.userStore.getUserById(testUsers[0]._id);
    assert.isNull(deletedUser);
  });


  test("delete One User - fail", async () => {
    const allUsersPreTest = await _.clone(db.userStore.getAllUsers());
    await db.userStore.deleteUserById("bad-id");
    const allUsersPostTest = await _.clone(db.userStore.getAllUsers());
    assert.equal(allUsersPreTest.length, allUsersPostTest.length);
  });

  test("update a user - success", async () => {
    const user = await db.userStore.addUser(maggie);
    maggie._id = user._id;
    assertSubset(maggie, user);
    const updatedUser = updatedMaggie;
    updatedUser._id = user._id;
    updatedUser.isAdmin = false;
    await db.userStore.updateUser(user._id, updatedUser);
    const finalUser = await db.userStore.getUserById(user._id);
    assertSubset(updatedUser, finalUser);
  });

  test("update a user - fail - another user with same email", async () => {
    const user = await db.userStore.addUser(maggie);
    const updatedUser = updatedMaggie;
    updatedUser.email = "bart@simpson2.com";
    updatedUser._id = user._id;
    updatedUser.isAdmin = false;
    const outcome = await expect(db.userStore.updateUser(user._id, updatedUser)).to.be.rejectedWith("Another user is already using that email address");
    console.log(outcome);
  });

  test("check if administrator", async () => {
    const newAdmin = await db.userStore.addUser(maggie);
    const outcome = await db.userStore.makeAdmin(newAdmin._id);
    const adminStatus = await db.userStore.checkAdmin(newAdmin._id);
    assert.equal(adminStatus, true);
    await db.userStore.revokeAdmin(newAdmin._id);
    const revokedStatus = await db.userStore.checkAdmin(newAdmin._id);
    assert.equal(revokedStatus, false);
  });
});

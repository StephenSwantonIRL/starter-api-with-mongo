import { assert } from "chai";
import { placeMarkService } from "./placemark-service.js";
import { decodeToken } from "../../api/jwt-utils.js";
import { maggie, maggieCredentials } from "../fixtures.js";

suite("Authentication API tests", async () => {
  setup(async () => {
    placeMarkService.clearAuth();
    //const returnedUser = await placeMarkService.createUser(maggie);
    //const response = await placeMarkService.authenticate(maggieCredentials);
    //await placeMarkService.deleteAllUsers();
    placeMarkService.clearAuth();
  });

  test("authenticate", async () => {
    const returnedUser = await placeMarkService.createUser(maggie);
    const response = await placeMarkService.authenticate(maggieCredentials);
    assert(response.success);
    assert.isDefined(response.token);
    await placeMarkService.deleteAllUsers();
  });

  test("verify Token", async () => {
    const returnedUser = await placeMarkService.createUser(maggie);
    const response = await placeMarkService.authenticate(maggieCredentials);

    const userInfo = decodeToken(response.token);
    assert.equal(userInfo.email, returnedUser.email);
    assert.equal(userInfo.userId, returnedUser._id);
    await placeMarkService.deleteAllUsers();
  });

  test("check Unauthorized", async () => {
    await placeMarkService.clearAuth();
    try {
      await placeMarkService.deleteAllUsers();
      assert.fail("Route not protected");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 401);
    }
  });
});

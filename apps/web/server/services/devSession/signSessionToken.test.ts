import { signSessionToken } from "#server/services/devSession/signSessionToken";
import { MOCK_ENVIRONMENT_VARIABLES } from "#shared/services/environment/constants.test";
import { describe, expect, test } from "vitest";

describe(signSessionToken, () => {
  // The expected value is HMAC-SHA256 of the token under the secret, computed once with node:crypto, so the test holds the
  // Signing to the algorithm the session reader verifies rather than to this function's own output
  test("signs the token as the value followed by its HMAC-SHA256 signature in base64", async () => {
    expect.hasAssertions();

    await expect(signSessionToken("a", MOCK_ENVIRONMENT_VARIABLES.BETTER_AUTH_SECRET)).resolves.toBe(
      "a.7LA0GVCx/UZyMmMPJSCoYl3YXwIMDbff00wao7YXPTI=",
    );
  });
});

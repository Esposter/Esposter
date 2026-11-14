import { SECRET_TOKEN_LENGTH } from "#src/util/secret/constants";
import { generateSecretToken } from "#src/util/secret/generateSecretToken";
import { secretTokenSchema } from "#src/util/secret/secretTokenSchema";
import { describe, expect, test } from "vitest";

describe(generateSecretToken, () => {
  test("yields a 43-character unpadded base64url string", () => {
    expect.hasAssertions();

    const token = generateSecretToken();

    expect(token).toHaveLength(SECRET_TOKEN_LENGTH);
    expect(secretTokenSchema.safeParse(token).success).toBe(true);
  });

  test("two calls differ", () => {
    expect.hasAssertions();

    expect(generateSecretToken()).not.toBe(generateSecretToken());
  });
});

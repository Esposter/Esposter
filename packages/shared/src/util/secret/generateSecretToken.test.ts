import { secretTokenSchema } from "#src/services/secret/secretTokenSchema";
import { generateSecretToken } from "#src/util/secret/generateSecretToken";
import { describe, expect, test } from "vitest";

describe(generateSecretToken, () => {
  test("yields a 43-character unpadded base64url string", () => {
    expect.hasAssertions();

    const token = generateSecretToken();

    expect(secretTokenSchema.safeParse(token).success).toBe(true);
  });

  test("two calls differ", () => {
    expect.hasAssertions();

    expect(generateSecretToken()).not.toBe(generateSecretToken());
  });
});

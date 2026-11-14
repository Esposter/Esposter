import { checkIsSecretEqual } from "#src/util/secret/checkIsSecretEqual";
import { describe, expect, test } from "vitest";

describe(checkIsSecretEqual, () => {
  test("refuses a prefix of the secret, which a byte-by-byte guess would present", () => {
    expect.hasAssertions();

    const secret = "secret";

    expect(checkIsSecretEqual(secret, secret)).toBe(true);
    expect(checkIsSecretEqual(secret.slice(0, -1), secret)).toBe(false);
  });
});

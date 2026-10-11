import { describe, expect, test } from "vitest";

import { generateNonce } from "#src/runtime/services/generateNonce";

describe(generateNonce, () => {
  test("every request gets its own nonce, base64url of the nonce's bytes", () => {
    expect.hasAssertions();

    const nonces = [generateNonce(), generateNonce(), generateNonce()];
    expect(new Set(nonces).size).toBe(3);
    expect(nonces.every((nonce) => /^[\w-]{24}$/u.test(nonce))).toBe(true);
  });
});

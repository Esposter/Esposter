import { generateNonce } from "#src/runtime/services/generateNonce";
import { describe, expect, test } from "vitest";

describe(generateNonce, () => {
  test("every request gets its own nonce, base64 of the nonce's bytes", () => {
    expect.hasAssertions();

    const nonces = [generateNonce(), generateNonce(), generateNonce()];
    expect(new Set(nonces).size).toBe(3);
    expect(nonces.every((nonce) => /^[\d+/A-Za-z]{24}={0}$/u.test(nonce))).toBe(true);
  });
});

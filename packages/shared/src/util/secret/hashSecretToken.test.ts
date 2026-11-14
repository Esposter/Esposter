import { SECRET_TOKEN_HASH_LENGTH } from "#src/util/secret/constants";
import { hashSecretToken } from "#src/util/secret/hashSecretToken";
import { describe, expect, test } from "vitest";

describe(hashSecretToken, () => {
  test("yields the SHA-256 of the token as lowercase hex, so a stored hash is reproducible from the token alone", async () => {
    expect.hasAssertions();

    // The SHA-256 of "abc", a known answer that pins the algorithm and the encoding a stored hash was written with
    await expect(hashSecretToken("abc")).resolves.toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    await expect(hashSecretToken("abc")).resolves.toHaveLength(SECRET_TOKEN_HASH_LENGTH);
  });
});

import { describe, expect, test } from "vitest";

import { generateHash } from "#src/runtime/services/generateHash";

describe(generateHash, () => {
  const CONTENT = "abc";
  const HASH_ALGORITHM = "SHA-384";

  test("#395 a Buffer of a file's bytes hashes as the same content does as a string", async () => {
    expect.hasAssertions();

    await expect(generateHash(Buffer.from(CONTENT), HASH_ALGORITHM)).resolves.toBe(
      await generateHash(CONTENT, HASH_ALGORITHM),
    );
  });

  test("the hash is named by its algorithm in lower case, then the base64 digest", async () => {
    expect.hasAssertions();

    await expect(generateHash(CONTENT, HASH_ALGORITHM)).resolves.toMatch(/^sha384-[\d+/A-Za-z]+={0,2}$/u);
  });
});

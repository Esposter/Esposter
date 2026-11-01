import { SRI_HASH_ALGORITHM } from "#src/runtime/constants";
import { generateHash } from "#src/runtime/services/generateHash";
import { describe, expect, test } from "vitest";

describe(generateHash, () => {
  const CONTENT = "abc";

  test("a Buffer of a file's bytes hashes as the same content does as a string", async () => {
    expect.hasAssertions();

    await expect(generateHash(Buffer.from(CONTENT), SRI_HASH_ALGORITHM)).resolves.toBe(
      await generateHash(CONTENT, SRI_HASH_ALGORITHM),
    );
  });

  test("the hash is named by its algorithm in lower case, then the base64 digest", async () => {
    expect.hasAssertions();

    await expect(generateHash(CONTENT, SRI_HASH_ALGORITHM)).resolves.toMatch(/^sha384-[\d+/A-Za-z]+={0,2}$/u);
  });
});

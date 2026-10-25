import type { Nitro } from "nitro/types";

import { SCRIPT_HASH } from "#src/constants.test";
import { computeSubresourceIntegrityHashes } from "#src/services/computeSubresourceIntegrityHashes";
import { setupTemporaryDirectory } from "#src/setupTemporaryDirectory.test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const createNitro = (publicDir: string): Nitro =>
  ({ options: { output: { publicDir }, runtimeConfig: { app: { baseURL: "/", cdnURL: "" } } } }) as unknown as Nitro;

describe(computeSubresourceIntegrityHashes, () => {
  const SCRIPT_CONTENT = "entry";
  const STYLESHEET_CONTENT = "body{}";
  const STYLESHEET_HASH = "sha384-myyg/hQ74aSgjBBvVME/QXAXEkT4Y9dHbVQ5C0lIyGpldvNLJV2IWc5ElXbqLi06";
  const getDirectory = setupTemporaryDirectory();

  test("each file of a nested public directory is keyed by the url it is served at", async () => {
    expect.hasAssertions();

    await mkdir(join(getDirectory(), "_nuxt"), { recursive: true });
    await writeFile(join(getDirectory(), "_nuxt", "entry.js"), SCRIPT_CONTENT);
    await writeFile(join(getDirectory(), "_nuxt", "entry.css"), STYLESHEET_CONTENT);

    await expect(computeSubresourceIntegrityHashes(createNitro(getDirectory()))).resolves.toStrictEqual({
      "/_nuxt/entry.css": STYLESHEET_HASH,
      "/_nuxt/entry.js": SCRIPT_HASH,
    });
  });

  test("a public directory the build has not written yet contributes no hashes", async () => {
    expect.hasAssertions();

    await expect(computeSubresourceIntegrityHashes(createNitro(join(getDirectory(), "public")))).resolves.toStrictEqual(
      {},
    );
  });
});

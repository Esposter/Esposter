import type { Nitro } from "nitro/types";

import { computeSubresourceIntegrityHashes } from "#src/services/computeSubresourceIntegrityHashes";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(computeSubresourceIntegrityHashes, () => {
  const SCRIPT_CONTENT = "entry";
  const SCRIPT_HASH = "sha384-62uBgnG6+YTGQNMl+obi6qVkdGZnlhGcgfthFhDiF516gWydfNbHtTpyulxi7Aeh";
  const STYLESHEET_CONTENT = "body{}";
  const STYLESHEET_HASH = "sha384-myyg/hQ74aSgjBBvVME/QXAXEkT4Y9dHbVQ5C0lIyGpldvNLJV2IWc5ElXbqLi06";
  const createNitro = (publicDir: string): Nitro =>
    ({ options: { output: { publicDir }, runtimeConfig: { app: { baseURL: "/", cdnURL: "" } } } }) as unknown as Nitro;
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "nuxt-security-module-"));
  });

  afterEach(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("each file of a nested public directory is keyed by the url it is served at", async () => {
    expect.hasAssertions();

    await mkdir(join(directory, "_nuxt"), { recursive: true });
    await writeFile(join(directory, "_nuxt", "entry.js"), SCRIPT_CONTENT);
    await writeFile(join(directory, "_nuxt", "entry.css"), STYLESHEET_CONTENT);

    await expect(computeSubresourceIntegrityHashes(createNitro(directory))).resolves.toStrictEqual({
      "/_nuxt/entry.css": STYLESHEET_HASH,
      "/_nuxt/entry.js": SCRIPT_HASH,
    });
  });

  test("a public directory the build has not written yet contributes no hashes", async () => {
    expect.hasAssertions();

    await expect(computeSubresourceIntegrityHashes(createNitro(join(directory, "public")))).resolves.toStrictEqual({});
  });
});

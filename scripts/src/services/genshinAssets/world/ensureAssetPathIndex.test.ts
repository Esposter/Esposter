import { ensureAssetPathIndex } from "#src/services/genshinAssets/world/ensureAssetPathIndex";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(ensureAssetPathIndex, () => {
  let directory: string;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "asset-index-"));
  });

  afterAll(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("returns a held index at its path without fetching it", async () => {
    expect.hasAssertions();

    const indexPath = join(directory, "gi-2.6.0.json");
    await writeFile(indexPath, "{}");

    await expect(ensureAssetPathIndex(indexPath)).resolves.toBe(indexPath);
  });
});

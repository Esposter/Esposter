import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";
import type { exportBlockByName as baseExportBlockByName } from "#src/services/genshinAssets/shared/exportBlockByName";

import { exportSpritesByName } from "#src/services/genshinAssets/sprites/exportSpritesByName";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The export is AnimeStudio's, so the test stands in for it: a run writes the PNGs the test gives it, or none
const { exportBlockByName, getFixtureRoot } = vi.hoisted(() => ({
  exportBlockByName: vi.fn<typeof baseExportBlockByName>(),
  getFixtureRoot: { root: "" },
}));
vi.mock(import("#src/services/genshinAssets/shared/exportBlockByName"), () => ({ exportBlockByName }));
vi.mock(import("#src/services/genshinAssets/sprites/constants"), () => ({
  get SPRITE_ATLAS_DIRECTORY() {
    return join(getFixtureRoot.root, "work", "atlases");
  },
  get SPRITE_DIRECTORY() {
    return join(getFixtureRoot.root, "sprites");
  },
  get SPRITE_DUMP_DIRECTORY() {
    return join(getFixtureRoot.root, "work", "dumps");
  },
  get SPRITE_WORK_DIRECTORY() {
    return join(getFixtureRoot.root, "work");
  },
}));
const FIXTURE_TEXTURE: IndexedAsset = {
  block: "00/11790361.blk",
  name: "UI_FixtureIcon",
  offset: 0,
  pathId: "1",
  type: "Texture2D",
};
vi.mock(import("#src/services/recreation/animeStudio/readIndexedAssets"), () => ({
  readIndexedAssets: (predicate: (asset: IndexedAsset) => boolean) =>
    Promise.resolve([FIXTURE_TEXTURE].filter((asset) => predicate(asset))),
}));

describe(exportSpritesByName, () => {
  // A 1 by 1 PNG, the file an export of the texture writes
  const PNG_BYTES = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64",
  );
  let spriteDirectory = "";

  beforeEach(async () => {
    getFixtureRoot.root = await mkdtemp(join(tmpdir(), "sprite-export-"));
    spriteDirectory = join(getFixtureRoot.root, "sprites");
    mkdirSync(spriteDirectory, { recursive: true });
  });

  afterEach(async () => {
    exportBlockByName.mockReset();
    await rm(getFixtureRoot.root, { force: true, recursive: true });
  });

  // A PNG an earlier run left under a requested name must not pass for this run's export, which here writes nothing
  test("a stale PNG from an earlier run does not stand for a name the run did not write", async () => {
    expect.hasAssertions();

    const stalePath = join(spriteDirectory, "UI_FixtureIcon.png");
    writeFileSync(stalePath, PNG_BYTES);

    await expect(exportSpritesByName(["UI_FixtureIcon"])).rejects.toStrictEqual(
      new InvalidOperationError(Operation.Create, spriteDirectory, "no PNG for UI_FixtureIcon"),
    );
    expect(existsSync(stalePath)).toBe(false);
  });

  test("reports each name the export wrote", async () => {
    expect.hasAssertions();

    exportBlockByName.mockImplementationOnce((_block, _type, names, directory) => {
      for (const name of names) writeFileSync(join(directory, `${name}.png`), PNG_BYTES);
    });

    await expect(exportSpritesByName(["UI_FixtureIcon"])).resolves.toStrictEqual(
      expect.stringContaining("1 of 1 names exported"),
    );
  });
});

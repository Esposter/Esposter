import { readExportedTerrainTiles } from "#src/services/genshinAssets/world/readExportedTerrainTiles";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readExportedTerrainTiles, () => {
  let meshDirectory: string;

  beforeEach(() => {
    meshDirectory = mkdtempSync(join(tmpdir(), "parity-terrain-meshes-"));
  });

  afterEach(() => {
    rmSync(meshDirectory, { force: true, recursive: true });
  });

  test("keeps only the tiles whose terrain mesh is on disk, not every tile the world names", () => {
    expect.hasAssertions();

    writeFileSync(join(meshDirectory, "BigWorldTerrain_2_-1.bin.obj"), "");

    expect(
      readExportedTerrainTiles(["BigWorldTerrain_2_-1.bin", "BigWorldTerrain_3_-1.bin"], meshDirectory),
    ).toStrictEqual(["BigWorldTerrain_2_-1.bin"]);
  });
});

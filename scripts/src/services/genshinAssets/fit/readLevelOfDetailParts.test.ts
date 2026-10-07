import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { readLevelOfDetailParts } from "#src/services/genshinAssets/fit/readLevelOfDetailParts";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const createPlacement = (mesh: string, father: string, materials: string[]): AssetPlacement => ({
  father,
  materials,
  mesh,
  name: mesh,
  position: [0, 0, 0],
  root: "",
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
});

describe(readLevelOfDetailParts, () => {
  const MESH_REGEX = /^(?<part>Tower)_Lod(?<level>\d)$/u;
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "read-level-of-detail-parts-"));
    for (const mesh of ["Tower_Lod0", "Tower_Lod1", "Tower_Lod2"]) writeFileSync(join(directory, `${mesh}.obj`), "");
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("fits a far level painted as the finest from the finest, and one painted otherwise from its own mesh", () => {
    expect.hasAssertions();

    const placements = [
      createPlacement("Tower_Lod0", "near", ["stone", "ground"]),
      createPlacement("Tower_Lod1", "near", ["stone", "ground"]),
      createPlacement("Tower_Lod1", "far", ["ground", "stone"]),
      createPlacement("Tower_Lod2", "farthest", ["ground"]),
    ];
    const { meshPathMap, partPlacements } = readLevelOfDetailParts(placements, MESH_REGEX, directory);

    expect(partPlacements.map(({ father, part }) => ({ father, part }))).toStrictEqual([
      { father: "near", part: "Tower" },
      { father: "far", part: "Tower" },
      { father: "farthest", part: "Tower_Lod2" },
    ]);
    expect(meshPathMap).toStrictEqual(
      new Map([
        ["Tower", join(directory, "Tower_Lod0.obj")],
        ["Tower_Lod2", join(directory, "Tower_Lod2.obj")],
      ]),
    );
  });
  test("names each set of materials the finest level is drawn with a part of its own", () => {
    expect.hasAssertions();

    const placements = [
      createPlacement("Tower_Lod0", "gilded", ["stone", "gold"]),
      createPlacement("Tower_Lod0", "plain", ["stone"]),
      createPlacement("Tower_Lod1", "far", ["stone"]),
    ];
    const { meshPathMap, partPlacements } = readLevelOfDetailParts(placements, MESH_REGEX, directory);

    expect(partPlacements.map(({ father, part }) => ({ father, part }))).toStrictEqual([
      { father: "gilded", part: "Tower" },
      { father: "plain", part: "Tower_Lod0" },
      { father: "far", part: "Tower_Lod0" },
    ]);
    expect(meshPathMap).toStrictEqual(
      new Map([
        ["Tower", join(directory, "Tower_Lod0.obj")],
        ["Tower_Lod0", join(directory, "Tower_Lod0.obj")],
      ]),
    );
  });
});

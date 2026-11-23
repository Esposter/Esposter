import type { SubCommandsDef } from "citty";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readGroundPieceAreas } from "#src/services/genshinAssets/fit/readGroundPieceAreas";
import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { TERRAIN_NAME_PREFIX } from "#src/services/genshinAssets/world/constants";
import { getOutlineTileNames } from "#src/services/genshinAssets/world/getOutlineTileNames";
import { readExportedTerrainTiles } from "#src/services/genshinAssets/world/readExportedTerrainTiles";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { join } from "node:path";

export const missingTilesCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: "The region whose export is checked, such as liyue or inazuma",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Print each terrain tile a region's area outlines name that its export lacks, as `missing`, then the count, which is the bar of a re-extraction: none missing. A tile no asset of the game's index names is `absent from the install` and is not counted",
    name: "missing-tiles",
  },
  run: async ({ args }) => {
    const component = parseDerivedAssetComponent(args.component);
    const world = await readWorldOptions(component);
    if (!world) throw new InvalidOperationError(Operation.Read, component, "has no open world to check");
    const expected = getOutlineTileNames(await readGroundPieceAreas(component), await readWorldOrigin(component));
    // A tile is exported when its terrain mesh is on disk, the mesh the witness lays it out from, not when the world
    // Names it
    const meshDirectory = join(getComponentDirectory(component).assets, AssetType.Mesh);
    const tileNames = world.terrainTiles.map(({ name }) => name);
    const exported = new Set(readExportedTerrainTiles(tileNames, meshDirectory));
    // A tile is in the install when the game's index names an asset of it, its textures under its own name, as the
    // Derivation finds the blocks holding a tile's TerrainData
    const indexedNames = (
      await readIndexedAssets(({ name }) => name.startsWith(TERRAIN_NAME_PREFIX), GENSHIN_ANIMESTUDIO_OPTIONS)
    ).map(({ name }) => name);
    const checkIsInInstall = (tileName: string): boolean =>
      indexedNames.some((name) => name.startsWith(`${tileName}_`));
    const unexported = expected.filter((tileName) => !exported.has(tileName));
    const missing = unexported.filter((tileName) => checkIsInInstall(tileName));
    console.log(`missing ${missing.length} of ${expected.length} outline tiles`);
    for (const tileName of missing) console.log(`missing ${tileName}`);
    for (const tileName of unexported.filter((name) => !checkIsInInstall(name)))
      console.log(`absent from the install ${tileName}`);
  },
});

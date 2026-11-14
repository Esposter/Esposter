/* oxlint-disable no-await-in-loop -- One block at a time, in the order the index lists them; One atlas at a time, each cut into all its sprites before the next */
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { GENSHIN_ANIMESTUDIO_OPTIONS, PNG_EXTENSION } from "#src/services/genshinAssets/shared/constants";
import { exportBlockByName } from "#src/services/genshinAssets/shared/exportBlockByName";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { checkSpriteAsset } from "#src/services/genshinAssets/sprites/checkSpriteAsset";
import { chooseSpriteAssets } from "#src/services/genshinAssets/sprites/chooseSpriteAssets";
import {
  SPRITE_ATLAS_DIRECTORY,
  SPRITE_DIRECTORY,
  SPRITE_DUMP_DIRECTORY,
  SPRITE_WORK_DIRECTORY,
} from "#src/services/genshinAssets/sprites/constants";
import { cutSprites } from "#src/services/genshinAssets/sprites/cutSprites";
import { readSpriteRectangle } from "#src/services/genshinAssets/sprites/readSpriteRectangle";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

// The index row each of the names is found in, within the block when one is named, and the names the index holds neither
// A sprite nor a texture of
const findSpriteAssets = async (
  names: readonly string[],
  block?: string,
): Promise<{ assets: IndexedAsset[]; missing: string[] }> =>
  chooseSpriteAssets(
    names,
    await readIndexedAssets(checkSpriteAsset(new Set(names), block), GENSHIN_ANIMESTUDIO_OPTIONS),
  );

// The dry run's report: one line per name, the row it was found in or that the index holds it nowhere
export const describeSpriteAssets = async (names: readonly string[], block?: string): Promise<string[]> => {
  const { assets, missing } = await findSpriteAssets(names, block);
  return [
    ...assets.map(({ block: assetBlock, name, type }) => `found ${name}: ${type} in ${assetBlock}`),
    ...missing.map((name) => `missing ${name}: not in the asset index`),
    `${assets.length} of ${names.length} names found`,
  ];
};

// Each block's rows of one type, handed to the export block by block, so a type's blocks are walked in one place
const exportBlocksOf = async (
  assets: readonly IndexedAsset[],
  type: AssetType,
  exportBlock: (block: string, blockAssets: IndexedAsset[]) => Promise<void> | void,
): Promise<void> => {
  for (const [block, blockAssets] of Map.groupBy(
    assets.filter((asset) => asset.type === type),
    (asset) => asset.block,
  ))
    await exportBlock(block, blockAssets);
};

// A block's sprites, each read from its dump for the atlas and the rectangle it is cut from. The atlases are exported
// Beside the dumps and each atlas's sprites are cut from it at once, so a sprite's pixels are the rectangle the game draws
const exportBlockSprites = async (block: string, sprites: readonly IndexedAsset[]): Promise<void> => {
  const spriteNames = sprites.map(({ name }) => name);
  exportBlockByName(block, AssetType.Sprite, spriteNames, SPRITE_DUMP_DIRECTORY, AnimeStudioExportType.Json);
  const cuts = spriteNames.map((name) => {
    const dumpPath = join(SPRITE_DUMP_DIRECTORY, `${name}.json`);
    if (!existsSync(dumpPath))
      throw new InvalidOperationError(Operation.Create, dumpPath, `AnimeStudio wrote no dump of ${name}`);
    return { name, ...readSpriteRectangle(parseMachineJson(readFileSync(dumpPath, "utf8"), reviveSourcePathId)) };
  });
  exportBlockByName(block, AssetType.Texture2D, [...new Set(cuts.map(({ atlas }) => atlas))], SPRITE_ATLAS_DIRECTORY);
  for (const [atlas, atlasCuts] of Map.groupBy(cuts, (cut) => cut.atlas)) {
    const atlasPath = join(SPRITE_ATLAS_DIRECTORY, `${atlas}${PNG_EXTENSION}`);
    if (!existsSync(atlasPath))
      throw new InvalidOperationError(
        Operation.Create,
        atlasPath,
        `AnimeStudio wrote no atlas for ${atlasCuts.map(({ name }) => name).join(", ")}`,
      );
    await cutSprites(
      atlasPath,
      atlasCuts.map(({ name, rectangle }) => ({
        outputPath: join(SPRITE_DIRECTORY, `${name}${PNG_EXTENSION}`),
        rectangle,
      })),
    );
  }
};

// Exports every name the index holds into its folder as a PNG under its name: a texture whole, a sprite cut from its atlas.
// A run that writes a name's PNG nowhere fails, and the names the index does not hold are reported, not failed
export const exportSpritesByName = async (names: readonly string[], block?: string): Promise<string> => {
  const { assets, missing } = await findSpriteAssets(names, block);
  rmSync(SPRITE_WORK_DIRECTORY, { force: true, recursive: true });
  for (const directory of [SPRITE_DIRECTORY, SPRITE_DUMP_DIRECTORY, SPRITE_ATLAS_DIRECTORY])
    mkdirSync(directory, { recursive: true });
  // A found name's PNG from an earlier run goes first, so the check below counts only what this run wrote
  for (const { name } of assets) rmSync(join(SPRITE_DIRECTORY, `${name}${PNG_EXTENSION}`), { force: true });
  await exportBlocksOf(assets, AssetType.Texture2D, (assetBlock, blockAssets) => {
    exportBlockByName(
      assetBlock,
      AssetType.Texture2D,
      blockAssets.map(({ name }) => name),
      SPRITE_DIRECTORY,
    );
  });
  await exportBlocksOf(assets, AssetType.Sprite, exportBlockSprites);
  const notExported = assets.filter(({ name }) => !existsSync(join(SPRITE_DIRECTORY, `${name}${PNG_EXTENSION}`)));
  if (notExported.length > 0)
    throw new InvalidOperationError(
      Operation.Create,
      SPRITE_DIRECTORY,
      `no PNG for ${notExported.map(({ name }) => name).join(", ")}`,
    );
  return `${assets.length} of ${names.length} names exported into ${SPRITE_DIRECTORY}; ${missing.length} not in the asset index: ${missing.join(", ")}`;
};

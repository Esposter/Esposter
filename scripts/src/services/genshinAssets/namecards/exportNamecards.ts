import {
  NAMECARD_ART_DIRECTORY,
  NAMECARD_DIRECTORY,
  NAMECARD_ICON_DIRECTORY,
} from "#src/services/genshinAssets/namecards/constants";
import { checkNamecardAsset } from "#src/services/genshinAssets/namecards/checkNamecardAsset";
import { checkSameFileNames } from "#src/services/genshinAssets/namecards/checkSameFileNames";
import { exportBlockNamecards } from "#src/services/genshinAssets/namecards/exportBlockNamecards";
import { getNamecardDirectory } from "#src/services/genshinAssets/namecards/getNamecardDirectory";
import { readNamecardNames } from "#src/services/genshinAssets/namecards/readNamecardNames";
import { ASSET_INDEX_PATH, GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, rmSync } from "node:fs";

const DIRECTORIES = [NAMECARD_ART_DIRECTORY, NAMECARD_ICON_DIRECTORY];
// The namecards' art and icons the asset index names, each a PNG under its name in one of two folders. A folder already
// Holding exactly those names is left as it is, so a rerun costs nothing. Any other is cleaned and exported block by
// Block, then checked for every name the index holds. An index naming no namecard is refused before any folder is touched
export const exportNamecards = async (): Promise<string> => {
  const assets = await readIndexedAssets(checkNamecardAsset, GENSHIN_ANIMESTUDIO_OPTIONS);
  if (assets.length === 0)
    throw new InvalidOperationError(Operation.Read, ASSET_INDEX_PATH, "no namecard texture is indexed");
  const assetsByDirectory = Map.groupBy(assets, ({ name }) => getNamecardDirectory(name));
  const expectedNamesOf = (directory: string): string[] =>
    (assetsByDirectory.get(directory) ?? []).map(({ name }) => name);
  if (DIRECTORIES.every((directory) => checkSameFileNames(expectedNamesOf(directory), readNamecardNames(directory))))
    return `${assets.length} namecards already match the index in ${NAMECARD_DIRECTORY}`;
  rmSync(NAMECARD_DIRECTORY, { force: true, recursive: true });
  for (const directory of DIRECTORIES) mkdirSync(directory, { recursive: true });
  for (const [block, blockAssets] of Map.groupBy(assets, (asset) => asset.block))
    for (const [directory, directoryAssets] of Map.groupBy(blockAssets, ({ name }) => getNamecardDirectory(name)))
      exportBlockNamecards(
        block,
        directoryAssets.map(({ name }) => name),
        directory,
      );
  const missingNames = DIRECTORIES.flatMap((directory) => {
    const exportedNames = readNamecardNames(directory);
    return expectedNamesOf(directory).filter((name) => !exportedNames.includes(name));
  });
  if (missingNames.length > 0)
    throw new InvalidOperationError(Operation.Create, NAMECARD_DIRECTORY, `no PNG for ${missingNames.join(", ")}`);
  return `${assets.length} namecards exported into ${NAMECARD_DIRECTORY}`;
};

import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { checkNamecardAsset } from "#src/services/genshinAssets/namecards/checkNamecardAsset";
import { checkSameFileNames } from "#src/services/genshinAssets/namecards/checkSameFileNames";
import {
  NAMECARD_ART_DIRECTORY,
  NAMECARD_DIRECTORY,
  NAMECARD_ICON_DIRECTORY,
  NAMECARD_ICON_PREFIX,
} from "#src/services/genshinAssets/namecards/constants";
import { GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { extname, join, parse } from "node:path";

const PNG_EXTENSION = ".png";
const DIRECTORIES = [NAMECARD_ART_DIRECTORY, NAMECARD_ICON_DIRECTORY];
// The folder a namecard's PNG is written to: its icon apart from its art
const getNamecardDirectory = (name: string): string =>
  name.startsWith(NAMECARD_ICON_PREFIX) ? NAMECARD_ICON_DIRECTORY : NAMECARD_ART_DIRECTORY;
// The names of the PNGs a folder holds, each by its file name without the extension
const readNamecardNames = (directory: string): string[] =>
  existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => extname(file) === PNG_EXTENSION)
        .map((file) => parse(file).name)
    : [];
// One block's namecard textures of a folder, read in one AnimeStudio run by their exact names. AnimeStudio writes each
// Type into a folder of its own, which is moved up beside the others, and a block that yields none is left to the check
const exportBlockNamecards = (block: string, names: readonly string[], directory: string): void => {
  runAnimeStudio([
    join(GAME_BLOCKS_DIRECTORY, block),
    directory,
    "--names",
    `^(${names.map((name) => RegExp.escape(name)).join("|")})$`,
    "--types",
    AssetType.Texture2D,
    "--group_assets",
    AnimeStudioGroupType.ByType,
  ]);
  const typeDirectory = join(directory, AssetType.Texture2D);
  if (!existsSync(typeDirectory)) return;
  for (const file of readdirSync(typeDirectory)) renameSync(join(typeDirectory, file), join(directory, file));
  rmSync(typeDirectory, { recursive: true });
};
// The namecards' art and icons the asset index names, each a PNG under its name in one of two folders. A folder already
// Holding exactly those names is left as it is, so a rerun costs nothing. Any other is cleaned and exported block by
// Block, then checked for every name the index holds
export const exportNamecards = async (): Promise<string> => {
  const assets = await readIndexedAssets(checkNamecardAsset);
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

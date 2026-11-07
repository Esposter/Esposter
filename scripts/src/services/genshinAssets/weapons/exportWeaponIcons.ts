import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { checkSameFileNames } from "#src/services/genshinAssets/shared/checkSameFileNames";
import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { exportBlockByName } from "#src/services/genshinAssets/shared/exportBlockByName";
import { readPngNames } from "#src/services/genshinAssets/shared/readPngNames";
import { WEAPON_ICON_DIRECTORY } from "#src/services/genshinAssets/weapons/constants";
import { getWeaponIconPlan } from "#src/services/genshinAssets/weapons/getWeaponIconPlan";
import { readWeaponIconNames } from "#src/services/genshinAssets/weapons/readWeaponIconNames";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { mkdirSync, rmSync } from "node:fs";

const describeNames = (label: string, names: readonly string[]): string =>
  names.length > 0 ? `\n${names.length} ${label}: ${names.join(", ")}` : "";

// The icons the weapon table names and the asset index holds, each a PNG under its name in one folder. A folder already
// Holding exactly those names is left as it is, so a rerun costs nothing, and any other is cleaned and exported block by
// Block. A name the index holds no texture for, or one it holds that no PNG came out of, is reported in the result in
// Place of being skipped
export const exportWeaponIcons = async (): Promise<string> => {
  const iconNames = readWeaponIconNames();
  const iconNameSet = new Set(iconNames);
  const assets = await readIndexedAssets(
    ({ name, type }) => type === AssetType.Texture2D && iconNameSet.has(name),
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  const { blockNamesMap, missingNames } = getWeaponIconPlan(iconNames, assets);
  const heldNames = [...blockNamesMap.values()].flat();
  const missingReport = describeNames("icons the index holds no texture for", missingNames);
  if (checkSameFileNames(heldNames, readPngNames(WEAPON_ICON_DIRECTORY)))
    return `${heldNames.length} weapon icons already match the index in ${WEAPON_ICON_DIRECTORY}${missingReport}`;
  rmSync(WEAPON_ICON_DIRECTORY, { force: true, recursive: true });
  mkdirSync(WEAPON_ICON_DIRECTORY, { recursive: true });
  for (const [block, names] of blockNamesMap)
    exportBlockByName(block, AssetType.Texture2D, names, WEAPON_ICON_DIRECTORY);
  const exportedNames = new Set(readPngNames(WEAPON_ICON_DIRECTORY));
  const unexportedNames = heldNames.filter((name) => !exportedNames.has(name));
  return `${exportedNames.size} weapon icons exported into ${WEAPON_ICON_DIRECTORY}${missingReport}${describeNames("indexed icons no PNG came out of", unexportedNames)}`;
};

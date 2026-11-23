import type { GameDataPublication } from "#src/models/shared/GameDataPublication";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import {
  CAB_MAP_PATH,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  INSTALLED_BLOCKS_DIRECTORY,
  LAYOUT_ASSET_TYPES,
} from "#src/services/genshinAssets/shared/constants";
import { exportBlockBySource } from "#src/services/genshinAssets/shared/exportBlockBySource";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import { checkIsHeldWeaponMesh } from "#src/services/genshinAssets/weapons/checkIsHeldWeaponMesh";
import { HELD_WEAPON_ANIMATOR_REGEX, WEAPON_ROOTS_KEY } from "#src/services/genshinAssets/weapons/constants";
import { deriveWeaponRoots } from "#src/services/genshinAssets/weapons/deriveWeaponRoots";
import { readPrefabBlocks } from "#src/services/genshinAssets/world/readPrefabBlocks";
import { parseCabMap } from "#src/services/recreation/animeStudio/parseCabMap";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";

// The root of every prefab that holds a held weapon's mesh, derived from the layouts of the blocks the index puts the
// Meshes and the weapons' animators in and of the blocks of the prefab files depending on the meshes' (the files the
// Index lists nothing in, which `readPrefabBlocks` follows), and published as the record the weapons' component reads.
// The layouts are dumped where `extract` dumps the component's, so the extract that follows reads them again. Each held
// Mesh that no game object of those layouts draws is noted, since no root reaches it, and each block the install lacks
// Is skipped and noted too
export const buildWeaponRoots = async (): Promise<{ notes: string[]; publication: GameDataPublication }> => {
  const assets = await readIndexedAssets(
    (asset) =>
      checkIsHeldWeaponMesh(asset) ||
      (asset.type === AssetType.Animator && HELD_WEAPON_ANIMATOR_REGEX.test(asset.name)),
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  const heldMeshes = assets.filter((asset) => checkIsHeldWeaponMesh(asset));
  const cabMap = parseCabMap(await readFile(CAB_MAP_PATH));
  const prefabBlockMap = await readPrefabBlocks(assets, cabMap, checkIsHeldWeaponMesh);
  const { layout } = getComponentDirectory(DerivedAssetComponent.Weapons);
  await rm(layout, { force: true, recursive: true });
  await mkdir(layout, { recursive: true });
  // The index lists blocks of the game's other builds, so a block the install lacks is skipped and noted, not fatal
  const blocks = [...new Set([...prefabBlockMap.values()].flat())];
  const absentBlocks: string[] = [];
  for (const block of blocks)
    if (existsSync(join(INSTALLED_BLOCKS_DIRECTORY, block)))
      // oxlint-disable-next-line no-await-in-loop -- One device: AnimeStudio reads one block at a time
      await exportBlockBySource(block, LAYOUT_ASSET_TYPES, AnimeStudioExportType.Json, layout);
    else absentBlocks.push(block);
  const sceneLayout = await readSceneLayout(layout);
  const { roots, unreachedMeshes } = deriveWeaponRoots(sceneLayout, cabMap, heldMeshes);
  return {
    notes: [
      ...(absentBlocks.length > 0
        ? [`${absentBlocks.length} blocks the install lacks, skipped: ${absentBlocks.join(", ")}`]
        : []),
      `${roots.length} roots hold ${heldMeshes.length - unreachedMeshes.length} of ${heldMeshes.length} held meshes`,
      ...(unreachedMeshes.length > 0
        ? [
            `${unreachedMeshes.length} held meshes no game object draws: ${unreachedMeshes.map(({ name }) => name).join(", ")}`,
          ]
        : []),
    ],
    publication: { indexes: {}, objects: { [WEAPON_ROOTS_KEY]: roots } },
  };
};

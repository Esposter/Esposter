import type { ExcelWeaponRow } from "#src/models/genshinAssets/stats/ExcelWeaponRow";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { WEAPON_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { HELD_WEAPON_MESH_REGEX } from "#src/services/genshinAssets/weapons/constants";
import { getWeaponMeshMap } from "#src/services/genshinAssets/weapons/getWeaponMeshMap";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { GameDataset } from "genshin-world";

// Which held mesh each weapon row pairs with, from the weapon table and the held meshes the asset index names, published
// As one record by the row's id. The rows with none are counted in the notes
export const fitWeaponMeshMap = async (): Promise<GameDataBuild> => {
  const assets = await readIndexedAssets(
    ({ name, type }) => type === AssetType.Mesh && HELD_WEAPON_MESH_REGEX.test(name),
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  const meshNames = new Set(assets.map(({ name }) => name));
  const rows = readExcelTable<ExcelWeaponRow>(WEAPON_TABLE_NAME);
  const weaponMeshMap = getWeaponMeshMap(rows, meshNames);
  return {
    notes: [
      `${Object.keys(weaponMeshMap.meshByWeaponId).length} weapon rows pair with a held mesh, ${weaponMeshMap.weaponIdsWithoutMesh.length} have none`,
    ],
    objects: { [`${GameDataset.WeaponShapes}/meshMap`]: weaponMeshMap },
  };
};

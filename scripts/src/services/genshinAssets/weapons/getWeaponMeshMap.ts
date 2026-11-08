import type { ExcelWeaponRow } from "#src/models/genshinAssets/stats/ExcelWeaponRow";
import type { WeaponMeshMap } from "#src/models/genshinAssets/weapons/WeaponMeshMap";

const TEXTURE_FOLDER_REGEX = /AvatarEquip\/(?<folder>[^/]+)\//u;

// Each weapon row paired with the mesh named after its texture folder, `<folder>_Model`, where the asset index holds one.
// A row whose folder names no mesh, or that names no folder, is recorded with none: a name guessed from the weapon's own
// Name would pick the wrong blade
export const getWeaponMeshMap = (
  rows: readonly Pick<ExcelWeaponRow, "awakenTexture" | "id">[],
  meshNames: ReadonlySet<string>,
): WeaponMeshMap => {
  const weaponIdMeshMap: Record<string, string> = {};
  const weaponIdsWithoutMesh: number[] = [];
  for (const { awakenTexture, id } of rows) {
    const folder = TEXTURE_FOLDER_REGEX.exec(awakenTexture)?.groups?.folder;
    const meshName = folder ? `${folder}_Model` : "";
    if (meshNames.has(meshName)) weaponIdMeshMap[id] = meshName;
    else weaponIdsWithoutMesh.push(id);
  }
  return { weaponIdMeshMap, weaponIdsWithoutMesh };
};

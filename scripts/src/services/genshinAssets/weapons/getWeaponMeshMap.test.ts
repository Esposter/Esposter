import { getWeaponMeshMap } from "#src/services/genshinAssets/weapons/getWeaponMeshMap";
import { describe, expect, test } from "vitest";

describe(getWeaponMeshMap, () => {
  const MESH_NAME = "Equip_Sword_Blunt_Model";
  const meshNames = new Set([MESH_NAME]);
  const heldRow = {
    awakenTexture:
      "ART/Equip/AvatarEquip/Equip_Sword_Blunt/Equip_Sword_Blunt_OverrideTexture/Equip_Sword_Blunt_02_Tex_Diffuse",
    id: 11_101,
  };
  const bareRow = {
    awakenTexture:
      "ART/Equip/AvatarEquip/Equip_Sword_Silver/Equip_Sword_Silver_OverrideTexture/Equip_Sword_Silver_02_Tex_Diffuse",
    id: 11_102,
  };

  test("a row whose folder names no mesh is recorded with none, not a guessed one", () => {
    expect.hasAssertions();

    const { weaponIdMeshMap, weaponIdsWithoutMesh } = getWeaponMeshMap([heldRow, bareRow], meshNames);

    expect(weaponIdMeshMap).toStrictEqual({ [heldRow.id]: MESH_NAME });
    expect(weaponIdsWithoutMesh).toStrictEqual([bareRow.id]);
  });
});

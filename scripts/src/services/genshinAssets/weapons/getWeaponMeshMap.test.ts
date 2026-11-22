import { getWeaponMeshMap } from "#src/services/genshinAssets/weapons/getWeaponMeshMap";
import { describe, expect, test } from "vitest";

describe(getWeaponMeshMap, () => {
  const MESH_NAME = "Equip_Sword_Blunt_Model";
  const meshNames = new Set([MESH_NAME]);
  const heldRow = { awakenTexture: "a/a/AvatarEquip/Equip_Sword_Blunt/a/a", id: 11_101 };
  const bareRow = { awakenTexture: "a/a/AvatarEquip/Equip_Sword_Silver/a/a", id: 11_102 };

  test("a row whose folder names no mesh is recorded with none, not a guessed one", () => {
    expect.hasAssertions();

    const { weaponIdMeshMap, weaponIdsWithoutMesh } = getWeaponMeshMap([heldRow, bareRow], meshNames);

    expect(weaponIdMeshMap).toStrictEqual({ [heldRow.id]: MESH_NAME });
    expect(weaponIdsWithoutMesh).toStrictEqual([bareRow.id]);
  });
});

import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

import { walkAssetClosure } from "#src/services/genshinAssets/blocks/walkAssetClosure";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { deriveWeaponRoots } from "#src/services/genshinAssets/weapons/deriveWeaponRoots";
import { describe, expect, test } from "vitest";

describe(deriveWeaponRoots, () => {
  const FILE = "cab-a";
  const BLOCK = "00/00000001.blk";
  const ROOT_NAME = "Equip_Sword_Blunt_Model";
  const ROOT_GAME_OBJECT_ID = "10";
  const DRAWN_MESH = { block: BLOCK, pathId: "30" };
  const UNDRAWN_MESH = { block: BLOCK, pathId: "31" };
  const cabMap = new Map<string, CabEntry>([[FILE, { block: BLOCK, dependencies: [], offset: 0 }]]);
  const createObject = (overrides: Partial<SceneObject>): SceneObject => ({
    block: "00000001",
    childIds: [],
    components: [],
    file: FILE,
    gameObjectId: "0",
    name: "",
    parentFile: FILE,
    parentId: "0",
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    scale: [1, 1, 1],
    transformId: "0",
    ...overrides,
  });
  // A root holding a child that draws one mesh: the weapon's blade, two transforms down from nothing
  const layout = {
    gameObjectDrawingMap: new Map([
      [
        toObjectKey(FILE, "20"),
        { materials: [], mesh: ROOT_NAME, pointers: [{ fileIndex: 0, pathId: DRAWN_MESH.pathId }] },
      ],
    ]),
    objects: [
      createObject({ childIds: ["21"], gameObjectId: ROOT_GAME_OBJECT_ID, name: ROOT_NAME, transformId: "11" }),
      createObject({ gameObjectId: "20", name: "Blade", parentId: "11", transformId: "21" }),
    ],
  };

  test("a root is the top of the prefab whose renderer draws a held mesh", () => {
    expect.hasAssertions();

    const { roots } = deriveWeaponRoots(layout, cabMap, [DRAWN_MESH]);
    const { assets } = walkAssetClosure(layout.objects, layout.gameObjectDrawingMap, roots, cabMap);

    expect(roots).toStrictEqual([{ block: BLOCK, name: ROOT_NAME, pathId: ROOT_GAME_OBJECT_ID }]);
    expect(assets).toContainEqual({ block: BLOCK, file: FILE, pathId: DRAWN_MESH.pathId });
  });

  test("a held mesh under a root whose file the CAB map lacks is reported, not counted as reached", () => {
    expect.hasAssertions();

    const unmappedFile = "cab-unmapped";
    const unmappedLayout = {
      gameObjectDrawingMap: layout.gameObjectDrawingMap,
      objects: [
        createObject({ file: unmappedFile, gameObjectId: ROOT_GAME_OBJECT_ID, name: ROOT_NAME, transformId: "11" }),
        createObject({
          gameObjectId: "20",
          name: "Blade",
          parentFile: unmappedFile,
          parentId: "11",
          transformId: "21",
        }),
      ],
    };

    const { roots, unreachedMeshes } = deriveWeaponRoots(unmappedLayout, cabMap, [DRAWN_MESH]);

    expect(roots).toStrictEqual([]);
    expect(unreachedMeshes).toStrictEqual([DRAWN_MESH]);
  });

  test("a held mesh no game object draws is reported, not left out", () => {
    expect.hasAssertions();

    const { unreachedMeshes } = deriveWeaponRoots(layout, cabMap, [DRAWN_MESH, UNDRAWN_MESH]);

    expect(unreachedMeshes).toStrictEqual([UNDRAWN_MESH]);
  });
});

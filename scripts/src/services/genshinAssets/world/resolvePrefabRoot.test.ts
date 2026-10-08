import { createSceneObject } from "#src/services/genshinAssets/shared/createSceneObject.test";
import { resolvePrefabRoot } from "#src/services/genshinAssets/world/resolvePrefabRoot";
import { describe, expect, test } from "vitest";

describe(resolvePrefabRoot, () => {
  test("roots a name at the one game object of that name among the candidate blocks", () => {
    expect.hasAssertions();

    const objects = [
      createSceneObject("1", "0", { block: "00010731", name: "Area_MdProps_Flower03_Vo" }),
      createSceneObject("2", "0", { block: "00999999", name: "Area_MdProps_Flower03_Vo" }),
    ];

    expect(resolvePrefabRoot("Area_MdProps_Flower03_Vo", ["00/00010731.blk"], objects)).toStrictEqual({
      block: "00/00010731.blk",
      name: "Area_MdProps_Flower03_Vo",
      pathId: "1",
    });
  });

  test("roots nothing where several game objects of the name stand below the top of their hierarchy", () => {
    expect.hasAssertions();

    const objects = [
      createSceneObject("1", "9", { block: "00010731", name: "Stages_SGrass12_Vo" }),
      createSceneObject("2", "9", { block: "00010731", name: "Stages_SGrass12_Vo" }),
    ];

    expect(resolvePrefabRoot("Stages_SGrass12_Vo", ["00/00010731.blk"], objects)).toBeUndefined();
  });
});

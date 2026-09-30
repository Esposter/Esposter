import { applySpawns } from "#src/services/genshinAssets/applySpawns";
import { createSceneObject } from "#src/services/genshinAssets/createSceneObject.test";
import { describe, expect, test } from "vitest";

describe(applySpawns, () => {
  test("hangs a spawned prefab's root from its anchor, and leaves a spawn no dump holds alone", () => {
    expect.hasAssertions();

    const objects = applySpawns(
      [createSceneObject("1", "0", { block: "a" }), createSceneObject("2", "0", { block: "a" })],
      [
        { anchor: { block: "a.blk", name: "", pathId: "1" }, prefab: { block: "a.blk", name: "", pathId: "2" } },
        { anchor: { block: "a.blk", name: "", pathId: "-1" }, prefab: { block: "a.blk", name: "", pathId: "1" } },
      ],
    );

    expect(objects.map(({ parentId }) => parentId)).toStrictEqual(["0", "1"]);
  });
});

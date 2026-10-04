import { walkAssetClosure } from "#src/services/genshinAssets/blocks/walkAssetClosure";
import { createSceneObject } from "#src/services/genshinAssets/shared/createSceneObject.test";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { describe, expect, test } from "vitest";

describe(walkAssetClosure, () => {
  test("follows a root's children and resolves what they draw through their file's external references", () => {
    expect.hasAssertions();

    const closure = walkAssetClosure(
      [
        createSceneObject("1", "0", { block: "a", childIds: ["2", "-1"], file: "a" }),
        createSceneObject("2", "1", { file: "a" }),
      ],
      new Map([
        [
          toObjectKey("a", "2"),
          {
            materials: [],
            mesh: "",
            pointers: [
              { fileIndex: 0, pathId: "3" },
              { fileIndex: 1, pathId: "3" },
              { fileIndex: 2, pathId: "3" },
            ],
          },
        ],
      ]),
      [
        { block: "a.blk", name: "", pathId: "1" },
        { block: "", name: "", pathId: "-1" },
      ],
      new Map([
        ["a", { block: "c", dependencies: ["b"] }],
        ["b", { block: "d", dependencies: [] }],
      ]),
    );

    expect({ ...closure, objects: closure.objects.map(({ transformId }) => transformId) }).toStrictEqual({
      assets: [
        { block: "c", file: "a", pathId: "3" },
        { block: "d", file: "b", pathId: "3" },
      ],
      objects: ["1", "2"],
      unresolved: ["1: 1 of its children in a not dumped", "2: file 2 of a, path ID 3", ": game object -1 in "],
    });
  });
});

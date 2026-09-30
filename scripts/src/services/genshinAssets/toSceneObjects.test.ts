import type { DumpedTransform } from "#src/models/genshinAssets/DumpedTransform";

import { toSceneObjects } from "#src/services/genshinAssets/toSceneObjects";
import { describe, expect, test } from "vitest";

const createTransform = (gameObjectId: string, fatherId: string, childIds: string[] = []): DumpedTransform => ({
  m_Children: childIds.map((m_PathID) => ({ m_PathID })),
  m_Father: { m_PathID: fatherId },
  m_GameObject: { m_PathID: gameObjectId, Name: gameObjectId },
  m_LocalPosition: { X: 0, Y: 0, Z: 0 },
  m_LocalRotation: { W: 1, X: 0, Y: 0, Z: 0 },
  m_LocalScale: { X: 1, Y: 1, Z: 1 },
});

describe(toSceneObjects, () => {
  test("names a transform whose game object was lost by the father its known child names", () => {
    expect.hasAssertions();

    const objects = toSceneObjects(
      [createTransform("group", "0", ["child-transform"]), createTransform("child", "group-transform")],
      new Map([["child", "child-transform"]]),
    );

    expect(objects.map(({ transformId }) => transformId)).toStrictEqual(["group-transform", "child-transform"]);
  });

  test("gives a group every game object of which was lost the levels of its part that name one father", () => {
    expect.hasAssertions();

    const objects = toSceneObjects(
      [
        createTransform("Tower_LodGroup (1)", "0", ["level-transform"]),
        createTransform("Tower_Lod0", "group-transform"),
      ],
      new Map(),
    );

    expect(objects[0]?.transformId).toBe("group-transform");
  });

  test("keeps a stand-in for a lost leaf, which still sits under its father", () => {
    expect.hasAssertions();

    const [leaf] = toSceneObjects([createTransform("leaf", "group-transform")], new Map());

    expect(leaf?.parentId).toBe("group-transform");
    expect(leaf?.transformId).toBe("gameObject:leaf");
  });
});

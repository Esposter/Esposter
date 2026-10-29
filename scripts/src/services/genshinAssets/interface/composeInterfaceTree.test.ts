import type { UiIndexEntry } from "#src/models/genshinAssets/ui/UiIndexEntry";

import { composeInterfaceTree } from "#src/services/genshinAssets/interface/composeInterfaceTree";
import { describe, expect, test } from "vitest";

describe(composeInterfaceTree, () => {
  const BLOCK = "00/04949489.blk";
  const CONTAINER = "-1001859426";
  const rect: UiIndexEntry["rect"] = {
    anchoredPosition: [0, 0],
    anchorMax: [1, 1],
    anchorMin: [0, 0],
    pivot: [0.5, 0.5],
    sizeDelta: [0, 0],
  };
  const createEntry = (
    name: string,
    transformId: string,
    fatherId: string,
    childIds: string[] = [],
    path: string[] = [],
  ): UiIndexEntry => ({
    block: BLOCK,
    childIds,
    components: [],
    container: CONTAINER,
    fatherId,
    name,
    path,
    pathId: `${name}-object`,
    rect,
    scale: [1, 1],
    transformId,
  });

  test("lists each piece's children in the order its Transform lists them, a child it lacks last, and stops at the depth asked", () => {
    expect.hasAssertions();

    const root = createEntry("Page", "page-transform", "", ["foot-transform", "head-transform"]);
    const entries = [
      root,
      createEntry("Head", "head-transform", "page-transform", ["cap-transform"], ["Page"]),
      createEntry("Foot", "foot-transform", "page-transform", [], ["Page"]),
      createEntry("Stray", "stray-transform", "page-transform", [], ["Page"]),
      createEntry("Cap", "cap-transform", "head-transform", [], ["Page", "Head"]),
    ];

    expect(composeInterfaceTree(entries, root)).toStrictEqual({
      ...rect,
      children: [
        { ...rect, children: [], components: [], name: "Foot", path: "Page/Foot", scale: [1, 1] },
        {
          ...rect,
          children: [{ ...rect, children: [], components: [], name: "Cap", path: "Page/Head/Cap", scale: [1, 1] }],
          components: [],
          name: "Head",
          path: "Page/Head",
          scale: [1, 1],
        },
        { ...rect, children: [], components: [], name: "Stray", path: "Page/Stray", scale: [1, 1] },
      ],
      components: [],
      name: "Page",
      path: "Page",
      scale: [1, 1],
    });
    expect(composeInterfaceTree(entries, root, 0).children).toStrictEqual([]);
  });
});

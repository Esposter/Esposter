import type { DumpedInterfaceRect } from "#src/models/genshinAssets/interface/DumpedInterfaceRect";

import { composeInterfaceTree } from "#src/services/genshinAssets/interface/composeInterfaceTree";
import { describe, expect, test } from "vitest";

describe(composeInterfaceTree, () => {
  const layout: DumpedInterfaceRect["layout"] = {
    anchoredPosition: [0, 0],
    anchorMax: [1, 1],
    anchorMin: [0, 0],
    pivot: [0.5, 0.5],
    sizeDelta: [0, 0],
  };
  const createRect = (name: string, childIds: string[] = []): DumpedInterfaceRect => ({
    childIds,
    fatherId: "",
    gameObjectId: `${name}-object`,
    layout,
    name,
    scale: [1, 1],
  });

  test("walks down from the root through each piece's children, found by their GameObjects' transforms", () => {
    expect.hasAssertions();

    const tree = composeInterfaceTree(
      [createRect("Page", ["foot-transform", "lost-transform"]), createRect("Foot")],
      new Map([
        ["Foot-object", "foot-transform"],
        ["Page-object", "page-transform"],
      ]),
      new Map([["Foot-object", ["Button"]]]),
      "Page",
    );

    expect(tree).toStrictEqual({
      ...layout,
      children: [{ ...layout, children: [], components: ["Button"], name: "Foot", path: "Page/Foot", scale: [1, 1] }],
      components: [],
      name: "Page",
      path: "Page",
      scale: [1, 1],
    });
  });
});

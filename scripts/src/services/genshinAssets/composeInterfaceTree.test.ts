import type { DumpedInterfaceRect } from "#src/models/genshinAssets/DumpedInterfaceRect";

import { composeInterfaceTree } from "#src/services/genshinAssets/composeInterfaceTree";
import { describe, expect, test } from "vitest";

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

describe(composeInterfaceTree, () => {
  test("walks down from the root through each piece's children, found by their GameObjects' transforms", () => {
    expect.hasAssertions();

    const tree = composeInterfaceTree(
      [createRect("Page", ["foot-transform", "lost-transform"]), createRect("Foot")],
      new Map([
        ["Page-object", "page-transform"],
        ["Foot-object", "foot-transform"],
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

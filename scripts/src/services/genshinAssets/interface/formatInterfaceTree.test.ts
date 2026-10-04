import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { formatInterfaceTree } from "#src/services/genshinAssets/interface/formatInterfaceTree";
import { describe, expect, test } from "vitest";

describe(formatInterfaceTree, () => {
  test("writes each piece on a line indented by its depth, with its layout and components", () => {
    expect.hasAssertions();

    const leaf: InterfaceNode = {
      anchoredPosition: [-54, 54],
      anchorMax: [1, 0],
      anchorMin: [1, 0],
      children: [],
      components: ["Button"],
      name: "Buttons",
      path: "Page/Buttons",
      pivot: [1, 0],
      scale: [1, 1],
      sizeDelta: [52, 520],
    };
    const root: InterfaceNode = {
      ...leaf,
      children: [leaf],
      components: [],
      name: "Page",
      path: "Page",
      scale: [2, 2],
    };

    expect(formatInterfaceTree(root)).toBe(
      "Page anchors 1,0 to 1,0, pivot 1,0, at -54,54, size 52,520 scale 2,2\n  Buttons anchors 1,0 to 1,0, pivot 1,0, at -54,54, size 52,520 (Button)",
    );
  });
});

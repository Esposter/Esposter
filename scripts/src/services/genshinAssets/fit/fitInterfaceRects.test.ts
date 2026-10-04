import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { fitInterfaceRects } from "#src/services/genshinAssets/fit/fitInterfaceRects";
import { describe, expect, test } from "vitest";

const createNode = (path: string, children: InterfaceNode[] = [], components: string[] = []): InterfaceNode => ({
  anchoredPosition: [0, 1],
  anchorMax: [1, 0],
  anchorMin: [0, 0],
  children,
  components,
  name: path.slice(path.lastIndexOf("/") + 1),
  path,
  pivot: [0, 0],
  scale: [1, 1],
  sizeDelta: [0, 1],
});

describe(fitInterfaceRects, () => {
  test("keys each piece by its path under the root and leaves out the root and a layout group's children", () => {
    expect.hasAssertions();

    const rect = { anchorMax: [1, 0], anchorMin: [0, 0], pivot: [0, 0], position: [0, 1], size: [0, 1] };
    const root = createNode("Page", [
      createNode("Page/Foot", [
        createNode("Page/Foot/Column", [createNode("Page/Foot/Column/Button")], ["GridLayoutGroup"]),
      ]),
      { ...createNode("Page/White"), scale: [1.1, 1.1] },
    ]);

    expect(fitInterfaceRects(root)).toStrictEqual({
      Foot: rect,
      "Foot/Column": rect,
      White: { ...rect, scale: [1.1, 1.1] },
    });
  });
});

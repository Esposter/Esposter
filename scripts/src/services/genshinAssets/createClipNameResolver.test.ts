import type { InterfaceNode } from "#src/models/genshinAssets/InterfaceNode";

import { createClipNameResolver } from "#src/services/genshinAssets/createClipNameResolver";
import { describe, expect, test } from "vitest";
import { crc32 } from "node:zlib";

describe(createClipNameResolver, () => {
  test("resolves a property, a path from any ancestor, and the animator's own empty path", () => {
    expect.hasAssertions();

    const node: InterfaceNode = {
      anchoredPosition: [0, 0],
      anchorMax: [0, 0],
      anchorMin: [0, 0],
      children: [],
      components: [],
      name: "Buttons",
      path: "Page/Foot/Buttons",
      pivot: [0, 0],
      scale: [1, 1],
      sizeDelta: [0, 0],
    };
    const resolveName = createClipNameResolver([node]);

    expect(resolveName(1_574_349_066)).toBe("m_Alpha");
    expect(resolveName(crc32("Foot/Buttons"))).toBe("Foot/Buttons");
    expect(resolveName(0)).toBe("(the animator)");
    expect(resolveName(1)).toBe("1");
  });
});

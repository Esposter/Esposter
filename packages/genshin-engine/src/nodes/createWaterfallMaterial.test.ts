import type { Node } from "three/webgpu";

import { createWaterfallMaterial } from "#src/nodes/createWaterfallMaterial";
import { createWaterUniforms } from "#src/water/createWaterUniforms";
import { time } from "three/tsl";
import { describe, expect, test } from "vitest";

// Every node the given node is built from, itself included
const collectNodes = (node: Node, collected = new Set<Node>()): Set<Node> => {
  if (collected.has(node)) return collected;
  collected.add(node);
  for (const childNode of node.getChildren()) collectNodes(childNode, collected);
  return collected;
};

describe(createWaterfallMaterial, () => {
  test("streaks move across the fall, since its opacity is built from the clock", () => {
    expect.hasAssertions();

    const waterfallMaterial = createWaterfallMaterial(createWaterUniforms());
    expect(collectNodes(waterfallMaterial.opacityNode ?? time).has(time)).toBe(true);
  });
});

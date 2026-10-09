import type { InteractiveMapLabel } from "#src/models/genshinAssets/points/InteractiveMapLabel";

import { flattenLabelTree } from "#src/services/genshinAssets/points/flattenLabelTree";
import { describe, expect, test } from "vitest";

describe(flattenLabelTree, () => {
  test("gives every label the id of the top-level label its branch sits under, the top-level label being its own", () => {
    expect.hasAssertions();
    const labels: InteractiveMapLabel[] = [
      { children: [{ children: [], id: 2, name: "Valberry" }], id: 1, name: "Local Specialties" },
      { children: [], id: 3, name: "Ores" },
    ];
    expect(flattenLabelTree(labels)).toStrictEqual([
      { categoryId: 1, id: 1, name: "Local Specialties" },
      { categoryId: 1, id: 2, name: "Valberry" },
      { categoryId: 3, id: 3, name: "Ores" },
    ]);
  });
});

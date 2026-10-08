import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";

import { selectCapitalPlacements } from "#src/services/genshinAssets/world/selectCapitalPlacements";
import { describe, expect, test } from "vitest";

const CAPITAL_PLACE = { x: 0, z: 0 };
const ARCHITECTURE_PREFAB_ID = 1;
const DECORATION_PREFAB_ID = 2;
const PREFAB_NAMES = new Map([
  [ARCHITECTURE_PREFAB_ID, "Stages_Build_BeaconTower01"],
  [DECORATION_PREFAB_ID, "Area_MdProps_Flower03_Vo"],
]);

const createPlacement = (prefabId: number, x: number, z: number): WorldPlacement => ({
  pathHash: "",
  position: [x, 0, z],
  prefabId,
  radius: 0,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
});

describe(selectCapitalPlacements, () => {
  test("keeps architecture in the radius past the view, and leaves out decoration there and far placements", () => {
    expect.hasAssertions();

    const architectureInRadius = createPlacement(ARCHITECTURE_PREFAB_ID, 550, 0);
    const architecturePastRadius = createPlacement(ARCHITECTURE_PREFAB_ID, 700, 0);
    const decorationInRadius = createPlacement(DECORATION_PREFAB_ID, 550, 0);
    const architectureInView = createPlacement(ARCHITECTURE_PREFAB_ID, 100, 100);
    const decorationInView = createPlacement(DECORATION_PREFAB_ID, 100, 100);

    expect(
      selectCapitalPlacements(
        [architectureInRadius, architecturePastRadius, decorationInRadius, architectureInView, decorationInView],
        PREFAB_NAMES,
        CAPITAL_PLACE,
      ),
    ).toStrictEqual([architectureInRadius, architectureInView, decorationInView]);
  });
});

import type { RegionGround } from "#src/models/world/RegionGround";

import { HOME_REALM_GROUND_HEIGHT } from "#src/services/home/constants";
import { useWorldGroundStore } from "#src/store/ground";
import { startTestWorldSession } from "#src/store/session.fixture";
import { TerrainFeatureKind } from "genshin-engine";
import { describe, expect, test } from "vitest";
import { shallowRef } from "vue";

describe(useWorldGroundStore, () => {
  const BASE_HEIGHT = 3;
  const PLATEAU_HEIGHT = 4;
  const baseGrounds: [RegionGround] = [{ base: BASE_HEIGHT, features: [], hills: [] }];

  const setUpGround = () => {
    startTestWorldSession();
    const isInHomeRealm = shallowRef(false);
    const regionGrounds = shallowRef<RegionGround[]>([]);
    const worldGroundStore = useWorldGroundStore();
    worldGroundStore.start({
      baseGrounds,
      getIsInHomeRealm: () => isInHomeRealm.value,
      getRegionGrounds: () => regionGrounds.value,
    });
    return { isInHomeRealm, regionGrounds, worldGroundStore };
  };

  test("the ground is built again as a region's ground arrives", () => {
    expect.hasAssertions();

    const { regionGrounds, worldGroundStore } = setUpGround();
    expect(worldGroundStore.getGroundHeight(0, 0)).toBe(BASE_HEIGHT);

    regionGrounds.value = [
      {
        base: BASE_HEIGHT,
        features: [{ falloff: 1, height: PLATEAU_HEIGHT, kind: TerrainFeatureKind.Plateau, radius: 10, x: 0, z: 0 }],
        hills: [],
      },
    ];
    expect(worldGroundStore.getGroundHeight(0, 0)).toBeCloseTo(BASE_HEIGHT + PLATEAU_HEIGHT);
  });

  test("the realm's floor is flat while the player is in the realm", () => {
    expect.hasAssertions();

    const { isInHomeRealm, worldGroundStore } = setUpGround();
    isInHomeRealm.value = true;

    expect(worldGroundStore.getGroundHeight(0, 0)).toBe(HOME_REALM_GROUND_HEIGHT);
  });

  test("a ground read before the session starts it is refused", () => {
    expect.hasAssertions();

    const { worldGroundStore } = setUpGround();
    worldGroundStore.stop();

    expect(() => worldGroundStore.getGroundHeight(0, 0)).toThrowErrorMatchingInlineSnapshot(
      `[NotInitializedError: WorldGroundStore is not initialized]`,
    );
  });
});

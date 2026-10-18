import type { SceneGroups } from "#src/models/sceneGroup/SceneGroups";

import { SceneGroupSource } from "#src/models/sceneGroup/SceneGroupSource";
import { getCookingStovePlace } from "#src/services/cooking/getCookingStovePlace";
import { describe, expect, test } from "vitest";

describe(getCookingStovePlace, () => {
  const place = { height: 5, position: { x: 10, z: 20 }, rotationY: 90, source: SceneGroupSource.ScenePoints };
  const sceneGroups: SceneGroups = {
    buildings: {
      "1": { name: "Alchemy", place: { position: { x: 1, z: 2 }, source: SceneGroupSource.ScenePoints } },
      "2": { name: "Restaurant", place },
    },
    groups: {},
  };

  test("the stove stands at its recorded place", () => {
    expect.hasAssertions();

    expect(getCookingStovePlace(sceneGroups, "Restaurant")).toStrictEqual(place);
  });

  test("a city with no stove record has none", () => {
    expect.hasAssertions();

    expect(getCookingStovePlace(sceneGroups, "Restaurant_liyue")).toBeUndefined();
  });
});

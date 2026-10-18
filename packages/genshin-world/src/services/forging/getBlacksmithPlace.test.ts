import type { SceneGroups } from "#src/models/sceneGroup/SceneGroups";

import { SceneGroupSource } from "#src/models/sceneGroup/SceneGroupSource";
import { MONDSTADT_BLACKSMITH_POINT_ID } from "#src/services/forging/constants";
import { getBlacksmithPlace } from "#src/services/forging/getBlacksmithPlace";
import { describe, expect, test } from "vitest";

describe(getBlacksmithPlace, () => {
  const place = { height: 5, position: { x: 10, z: 20 }, rotationY: 90, source: SceneGroupSource.ScenePoints };

  test("mondstadt's blacksmith stands at its recorded place", () => {
    expect.hasAssertions();

    const sceneGroups: SceneGroups = {
      buildings: { [MONDSTADT_BLACKSMITH_POINT_ID]: { name: "Blacksmith", place } },
      groups: {},
    };

    expect(getBlacksmithPlace(sceneGroups)).toStrictEqual(place);
  });
});

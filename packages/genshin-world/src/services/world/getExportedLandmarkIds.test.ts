import type { SceneExport } from "#src/models/scene/SceneExport";

import { WindrisePartFamily } from "#src/models/windrise/WindrisePartFamily";
import { createStatue } from "#src/services/shared/createStatue.test";
import { getExportedLandmarkIds } from "#src/services/world/getExportedLandmarkIds";
import { noop } from "@esposter/shared";
import { Box3, Group, Vector3 } from "three";
import { describe, expect, test } from "vitest";

// A component's exports holding one family over x from 0 to 1
const createSceneExport = (family: string): SceneExport => ({
  dispose: noop,
  familyBoundsMap: new Map([[family, new Box3(new Vector3(0, 0, -1), new Vector3(1, 1, 1))]]),
  parts: new Group(),
});

describe(getExportedLandmarkIds, () => {
  test("a landmark within the extent of the family its kind stands in for is drawn by the exports", () => {
    expect.hasAssertions();
    expect(
      getExportedLandmarkIds(
        [createStatue("inside", 0.5), createStatue("outside", 2)],
        [createSceneExport(WindrisePartFamily.Statue)],
      ),
    ).toStrictEqual(new Set(["inside"]));
  });

  test("a landmark within the extent of another family is drawn by our stand-in", () => {
    expect.hasAssertions();
    expect(
      getExportedLandmarkIds([createStatue("inside", 0.5)], [createSceneExport(WindrisePartFamily.Oak)]),
    ).toStrictEqual(new Set());
  });
});

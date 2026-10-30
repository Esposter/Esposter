import type { CatalogueArea } from "#src/models/world/CatalogueArea";
import type { WaypointLandmark } from "#src/models/world/WaypointLandmark";

import { DevUnlockKind } from "#src/models/dev/DevUnlockKind";
import { RegionId } from "#src/models/RegionId";
import { LandmarkIdStatuePointId } from "#src/models/statue/LandmarkIdStatuePointId";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { WorldLayer } from "#src/models/world/WorldLayer";
import { unlockLandmark } from "#src/services/dev/commands/unlockLandmark";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { WeatherKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(unlockLandmark, () => {
  const AREA_ID = "windrise";
  const AREA_NAME = "Windrise";
  const MONDSTADT_NAME = "Mondstadt";
  const UNKNOWN_NAME = "Zzz";
  const WAYPOINT_ID = "windrise-waypoint-1";
  const STATUE_LANDMARK_ID: string = LandmarkIdStatuePointId.WindriseStatueOfTheSeven;
  const area: CatalogueArea = {
    id: AREA_ID,
    layer: WorldLayer.Surface,
    name: AREA_NAME,
    outline: [],
    subareas: [],
    subregion: "",
    weathers: [WeatherKind.Clear],
  };
  const waypoint: WaypointLandmark = {
    areaId: AREA_ID,
    arrival: { heightOffset: 0, position: { x: 0, z: 0 }, rotation: 0 },
    heightOffset: 0,
    id: WAYPOINT_ID,
    kind: LandmarkKind.TeleportWaypoint,
    position: { x: 0, z: 0 },
    rotation: 0,
  };
  const tables = {
    catalogue: { regions: [{ areas: [area], id: RegionId.Mondstadt, name: MONDSTADT_NAME }] },
    waypointLandmarks: [waypoint],
  };

  test("each writes the same save field the game's own act writes", () => {
    expect.hasAssertions();

    expect(unlockLandmark(EMPTY_GENSHIN_SAVE, { kind: DevUnlockKind.Waypoint, name: AREA_NAME }, tables)).toStrictEqual(
      { ok: true, save: { ...EMPTY_GENSHIN_SAVE, unlockedLandmarks: [WAYPOINT_ID] }, value: AREA_NAME },
    );
    expect(
      unlockLandmark(EMPTY_GENSHIN_SAVE, { kind: DevUnlockKind.Region, name: MONDSTADT_NAME }, tables),
    ).toStrictEqual({
      ok: true,
      save: { ...EMPTY_GENSHIN_SAVE, unlockedLandmarks: [STATUE_LANDMARK_ID] },
      value: MONDSTADT_NAME,
    });
  });

  test("a name no waypoint or region holds answers its error and writes no save", () => {
    expect.hasAssertions();

    expect(
      unlockLandmark(EMPTY_GENSHIN_SAVE, { kind: DevUnlockKind.Waypoint, name: UNKNOWN_NAME }, tables),
    ).toStrictEqual({ error: `unknown waypoint ${UNKNOWN_NAME}`, ok: false });
  });
});

import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { WaypointLandmark } from "#src/models/world/WaypointLandmark";

import { DomainKind } from "#src/models/domains/DomainKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeJumpLandmarkTextKey } from "#src/services/map/computeJumpLandmarkTextKey";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

const arrival = { heightOffset: 0, position: { x: 0, z: 0 }, rotation: 0 };

describe(computeJumpLandmarkTextKey, () => {
  test("names a domain entrance by its own title", () => {
    expect.hasAssertions();

    const entrance: DomainEntranceLandmark = {
      areaId: "windrise",
      arrival,
      domainKind: DomainKind.Trounce,
      entryId: 1006,
      heightOffset: 0,
      id: "",
      kind: LandmarkKind.DomainEntrance,
      position: { x: 0, z: 0 },
      rotation: 0,
      titleTextKey: GameTextKey.DomainEntrance24,
    };

    expect(computeJumpLandmarkTextKey(entrance)).toBe(GameTextKey.DomainEntrance24);
  });

  test("names a locked Teleport Waypoint by its own title, not a statue's", () => {
    expect.hasAssertions();

    const waypoint: WaypointLandmark = {
      areaId: "windrise",
      arrival,
      heightOffset: 0,
      id: "",
      kind: LandmarkKind.TeleportWaypoint,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    expect(computeJumpLandmarkTextKey(waypoint)).toBe(GameTextKey.TeleportWaypoint);
  });

  test("names a Statue of The Seven by the statue's title", () => {
    expect.hasAssertions();

    const statue: StatueLandmark = {
      areaId: "windrise",
      heightOffset: 0,
      id: "",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    expect(computeJumpLandmarkTextKey(statue)).toBe(GameTextKey.StatueOfTheSeven);
  });
});

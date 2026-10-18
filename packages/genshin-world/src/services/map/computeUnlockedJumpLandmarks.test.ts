import type { Landmark } from "#src/models/world/Landmark";

import { DomainKind } from "#src/models/domains/DomainKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeUnlockedJumpLandmarks } from "#src/services/map/computeUnlockedJumpLandmarks";
import { describe, expect, test } from "vitest";

const ARRIVAL = { heightOffset: 0, position: { x: 1, z: 2 }, rotation: 0 };
const domainEntrance: Landmark = {
  areaId: "area-1",
  arrival: ARRIVAL,
  domainKind: DomainKind.Blessing,
  entryId: 1,
  heightOffset: 0,
  id: "domain-entrance-1",
  kind: LandmarkKind.DomainEntrance,
  position: { x: 1, z: 2 },
  rotation: 0,
};

describe(computeUnlockedJumpLandmarks, () => {
  test("an unlocked entrance joins the jumps", () => {
    expect.hasAssertions();

    expect(computeUnlockedJumpLandmarks([domainEntrance], new Set([domainEntrance.id]))).toStrictEqual([
      domainEntrance,
    ]);
  });

  test("a locked entrance is not a jump target", () => {
    expect.hasAssertions();

    expect(computeUnlockedJumpLandmarks([domainEntrance], new Set())).toStrictEqual([]);
  });
});

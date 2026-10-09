import type { Resident } from "#src/models/world/Resident";
import type { ResidentSpot } from "#src/models/world/ResidentSpot";

import { computeResidentSpot } from "#src/services/resident/computeResidentSpot";
import { DAY_END_MINUTES, DAY_START_MINUTES } from "#src/services/resident/constants";
import { describe, expect, test } from "vitest";

const DAY_SPOT: ResidentSpot = { position: { x: 1, z: 2 }, rotation: 0 };
const NIGHT_SPOT: ResidentSpot = { position: { x: 3, z: 4 }, rotation: 1 };
const RESIDENT: Resident = { areaId: "1", day: DAY_SPOT, id: "1", nameTextId: "1", night: NIGHT_SPOT, talkId: "1" };

describe(computeResidentSpot, () => {
  test("keeps the day spot from six in the morning until seven at night, and the night spot either side", () => {
    expect.hasAssertions();
    expect(computeResidentSpot(RESIDENT, DAY_START_MINUTES - 1)).toStrictEqual(NIGHT_SPOT);
    expect(computeResidentSpot(RESIDENT, DAY_START_MINUTES)).toStrictEqual(DAY_SPOT);
    expect(computeResidentSpot(RESIDENT, DAY_END_MINUTES - 1)).toStrictEqual(DAY_SPOT);
    expect(computeResidentSpot(RESIDENT, DAY_END_MINUTES)).toStrictEqual(NIGHT_SPOT);
  });

  test("is absent in a period the resident keeps no spot for", () => {
    expect.hasAssertions();
    expect(computeResidentSpot({ ...RESIDENT, night: undefined }, DAY_END_MINUTES)).toBeUndefined();
    expect(computeResidentSpot({ ...RESIDENT, day: undefined }, DAY_START_MINUTES)).toBeUndefined();
  });
});

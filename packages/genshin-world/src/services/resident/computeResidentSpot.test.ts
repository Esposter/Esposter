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

  test("keeps the day spot through the night when the resident has no night spot", () => {
    expect.hasAssertions();
    expect(computeResidentSpot({ ...RESIDENT, night: undefined }, DAY_END_MINUTES)).toStrictEqual(DAY_SPOT);
    expect(computeResidentSpot({ ...RESIDENT, night: undefined }, DAY_START_MINUTES - 1)).toStrictEqual(DAY_SPOT);
  });

  test("is absent at night only where the data says the resident is absent then", () => {
    expect.hasAssertions();
    expect(
      computeResidentSpot({ ...RESIDENT, absentAtNight: true, night: undefined }, DAY_END_MINUTES),
    ).toBeUndefined();
    expect(computeResidentSpot({ ...RESIDENT, absentAtNight: true }, DAY_START_MINUTES - 1)).toBeUndefined();
    expect(computeResidentSpot({ ...RESIDENT, absentAtNight: true }, DAY_START_MINUTES)).toStrictEqual(DAY_SPOT);
  });

  test("is absent in the day when the resident keeps no day spot", () => {
    expect.hasAssertions();
    expect(computeResidentSpot({ ...RESIDENT, day: undefined }, DAY_START_MINUTES)).toBeUndefined();
  });
});

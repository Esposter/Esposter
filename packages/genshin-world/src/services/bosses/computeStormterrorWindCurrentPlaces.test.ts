import { computeStormterrorWindCurrentPlaces } from "#src/services/bosses/computeStormterrorWindCurrentPlaces";
import { STORMTERROR_WIND_CURRENTS } from "#src/services/bosses/stormterror";
import { DOMAIN_ARENA_SPREAD } from "#src/services/domains/constants";
import { describe, expect, test } from "vitest";

const CENTER = { x: 10, z: -4 };

describe(computeStormterrorWindCurrentPlaces, () => {
  test("each wind current stands beyond the camp's ring, at one distance from the arena's center", () => {
    expect.hasAssertions();

    const places = computeStormterrorWindCurrentPlaces(CENTER);
    const distances = places.map(({ position }) => Math.hypot(position.x - CENTER.x, position.z - CENTER.z));

    expect(places.map(({ name }) => name)).toStrictEqual(STORMTERROR_WIND_CURRENTS.map(({ name }) => name));
    expect(Math.min(...distances)).toBeGreaterThan(DOMAIN_ARENA_SPREAD);
    expect(Math.max(...distances) - Math.min(...distances)).toBeCloseTo(0);
  });
});

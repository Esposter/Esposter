import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { SightTrailRibbon } from "#src/models/sight/SightTrailRibbon";

import {
  SIGHT_TRAIL_CAPACITY,
  SIGHT_TRAIL_FADE,
  SIGHT_TRAIL_POINT_CAPACITY,
  SIGHT_TRAIL_STEP,
  SIGHT_TRAIL_WIDTH,
} from "#src/services/elementalSight/constants";
import { writeSightTrails } from "#src/services/elementalSight/writeSightTrails";
import { describe, expect, test } from "vitest";

const getGroundHeight = (x: number, z: number) => x + z;

const createRibbon = (): SightTrailRibbon => {
  const vertexCount = SIGHT_TRAIL_CAPACITY * SIGHT_TRAIL_POINT_CAPACITY * 2;
  return {
    colors: new Float32Array(vertexCount * 3),
    indices: new Uint32Array(SIGHT_TRAIL_CAPACITY * (SIGHT_TRAIL_POINT_CAPACITY - 1) * 6),
    positions: new Float32Array(vertexCount * 3),
  };
};

describe(writeSightTrails, () => {
  const ORIGIN = { x: 0, z: 0 };
  const COURT = { x: 0, z: 2 * SIGHT_TRAIL_STEP };
  const createSight = (isOn: boolean): ElementalSight => ({ isOn, origin: ORIGIN, spreadSeconds: 0 });

  test("a seelie's court draws a trail while the sight is on", () => {
    expect.hasAssertions();

    const ribbon = createRibbon();
    expect(writeSightTrails(ribbon, createSight(true), ORIGIN, [COURT], getGroundHeight)).toBe(6 * 2);
    // The court's two vertices are the last pair of the trail's strip, each across the trail at the court's width
    expect(ribbon.positions[12]).toBe(-SIGHT_TRAIL_WIDTH / 2);
    expect(ribbon.positions[14]).toBe(COURT.z);
    expect(ribbon.positions[15]).toBe(SIGHT_TRAIL_WIDTH / 2);
    expect(ribbon.positions[17]).toBe(COURT.z);
  });

  test("no trail is drawn while the sight is off", () => {
    expect.hasAssertions();

    expect(writeSightTrails(createRibbon(), createSight(false), ORIGIN, [COURT], getGroundHeight)).toBe(0);
  });

  test("a trail stays bright while the sight mutes the scene", () => {
    expect.hasAssertions();

    const ribbon = createRibbon();
    writeSightTrails(ribbon, createSight(true), ORIGIN, [COURT], getGroundHeight);
    expect(ribbon.colors.slice(0, 6)).toStrictEqual(new Float32Array(6).fill(1));
  });

  test("a trail fades toward its end", () => {
    expect.hasAssertions();

    const ribbon = createRibbon();
    writeSightTrails(ribbon, createSight(true), ORIGIN, [COURT], getGroundHeight);
    expect(ribbon.colors.slice(12, 18)).toStrictEqual(new Float32Array(6).fill(1 - SIGHT_TRAIL_FADE));
  });
});

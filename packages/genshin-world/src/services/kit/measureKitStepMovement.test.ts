import type { GroundPoint } from "genshin-engine";

import { measureKitStepMovement } from "#src/services/kit/measureKitStepMovement";
import { describe, expect, test } from "vitest";

const IANSAN = 10_000_110;
const OTHER = 10_000_002;
const START: GroundPoint = { x: 0, z: 0 };
const END: GroundPoint = { x: 3, z: 4 };

describe(measureKitStepMovement, () => {
  test("measures the ground distance the field character's body moved across the step", () => {
    expect.hasAssertions();

    expect(measureKitStepMovement({ characterId: OTHER, fieldCharacterId: OTHER, from: START, to: END })).toBe(5);
  });

  test("measures none on the step a character swaps on to the field, or for a body that stays", () => {
    expect.hasAssertions();

    expect([
      measureKitStepMovement({ characterId: IANSAN, fieldCharacterId: OTHER, from: START, to: END }),
      measureKitStepMovement({ characterId: OTHER, fieldCharacterId: OTHER, from: END, to: END }),
    ]).toStrictEqual([0, 0]);
  });
});

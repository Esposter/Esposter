import type { WorldEffect } from "#src/models/effects/WorldEffect";

import { WorldEffectKind } from "#src/models/effects/WorldEffectKind";
import { stepWorldEffects } from "#src/services/effects/stepWorldEffects";
import { describe, expect, test } from "vitest";

describe(stepWorldEffects, () => {
  test("drops each world effect whose life has run out, and keeps the rest with their life run down", () => {
    expect.hasAssertions();
    const effects: WorldEffect[] = [
      { kind: WorldEffectKind.Spark, position: { x: 0, z: 0 }, seconds: 0.5, secondsRemaining: 0.25 },
      { kind: WorldEffectKind.Flash, position: { x: 1, z: 0 }, seconds: 1, secondsRemaining: 1 },
    ];

    stepWorldEffects(effects, 0.5);

    expect(effects).toStrictEqual([
      { kind: WorldEffectKind.Flash, position: { x: 1, z: 0 }, seconds: 1, secondsRemaining: 0.5 },
    ]);
  });
});

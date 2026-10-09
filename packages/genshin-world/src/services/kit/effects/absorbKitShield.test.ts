import type { KitEffect } from "#src/models/kit/KitEffect";

import { absorbKitShield } from "#src/services/kit/effects/absorbKitShield";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;

describe(absorbKitShield, () => {
  test("absorbs damage up to its health and gives back the rest, and is spent when its health runs out", () => {
    expect.hasAssertions();
    const effects: KitEffect[] = [{ characterId: CHARACTER_ID, health: 100, kind: "shield", secondsRemaining: 12 }];
    expect(absorbKitShield(effects, CHARACTER_ID, 40)).toBe(0);
    expect(absorbKitShield(effects, CHARACTER_ID, 80)).toBe(20);
    expect(effects).toStrictEqual([{ characterId: CHARACTER_ID, health: 0, kind: "shield", secondsRemaining: 0 }]);
  });

  test("passes damage through when another character holds the shield", () => {
    expect.hasAssertions();
    const effects: KitEffect[] = [{ characterId: 2, health: 100, kind: "shield", secondsRemaining: 12 }];
    expect(absorbKitShield(effects, CHARACTER_ID, 40)).toBe(40);
  });
});

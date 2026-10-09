import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { DILUC_KIT } from "#src/services/kit/characters/dilucKit";
import { infuseKitHits } from "#src/services/kit/effects/infuseKitHits";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(infuseKitHits, () => {
  test("infuses a normal attack and a collision at their gauges, and leaves a skill's hit as it was", () => {
    expect.hasAssertions();
    const normalHit = takeOne(takeOne(DILUC_KIT.normalAttacks).hits);
    const skillHit = takeOne(DILUC_KIT.elementalSkill.hits);
    const collisionHit = DILUC_KIT.plungeCollision;
    const landedHits: KitHit[] = [normalHit, skillHit, collisionHit];
    infuseKitHits(DILUC_KIT, Element.Pyro, landedHits, 0);
    expect(landedHits).toStrictEqual([
      { ...normalHit, element: Element.Pyro, gauge: 1 },
      skillHit,
      { ...collisionHit, element: Element.Pyro, gauge: 0 },
    ]);
  });
});

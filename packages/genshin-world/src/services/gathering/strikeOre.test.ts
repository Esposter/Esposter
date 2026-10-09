import type { OreHit } from "#src/models/gathering/OreHit";

import { strikeOre } from "#src/services/gathering/strikeOre";
import { describe, expect, test } from "vitest";

describe(strikeOre, () => {
  const ironChunkRequirement = { blunt: 29, melee: 200 };
  const hitArea = { angle: Math.PI, height: 2, radius: 3 };

  test("seven blunt hits of 4.2 break an Iron Chunk, and six leave it standing", () => {
    expect.hasAssertions();
    const bluntHit: OreHit = { hitArea, isBlunt: true, isMelee: false, poiseDamage: 4.2 };
    const sixHitShare = Array.from({ length: 6 }).reduce<number>(
      (share) => strikeOre(share, bluntHit, ironChunkRequirement),
      0,
    );
    expect(sixHitShare).toBeLessThan(1);
    expect(strikeOre(sixHitShare, bluntHit, ironChunkRequirement)).toBe(1);
  });

  test("a melee hit and a blunt hit each add their own share", () => {
    expect.hasAssertions();
    const meleeHit: OreHit = { hitArea, isBlunt: false, isMelee: true, poiseDamage: 100 };
    const bluntHit: OreHit = { hitArea, isBlunt: true, isMelee: false, poiseDamage: 14.5 };
    expect(strikeOre(0, meleeHit, ironChunkRequirement)).toBe(0.5);
    expect(strikeOre(0, bluntHit, ironChunkRequirement)).toBe(0.5);
  });

  test("a hit neither blunt nor melee adds nothing", () => {
    expect.hasAssertions();
    const otherHit: OreHit = { hitArea, isBlunt: false, isMelee: false, poiseDamage: 100 };
    expect(strikeOre(0.25, otherHit, ironChunkRequirement)).toBe(0.25);
  });
});

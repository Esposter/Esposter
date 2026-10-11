import type { OreHit } from "#src/models/gathering/OreHit";
import type { OrePoiseRequirement } from "#src/models/gathering/OrePoiseRequirement";

import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { OreItemIdBreakPoiseMap } from "#src/services/gathering/OreItemIdBreakPoiseMap";
import { readReactionOreHit } from "#src/services/gathering/readReactionOreHit";
import { strikeOre } from "#src/services/gathering/strikeOre";
import { describe, expect, test } from "vitest";

// An ore's broken share once the same hit has struck it a number of times from whole, none without a hit
const strikeOreTimes = (
  hitCount: number,
  hit: OreHit | undefined,
  requirement: OrePoiseRequirement | undefined,
): number =>
  hit && requirement
    ? Array.from({ length: hitCount }).reduce<number>((share) => strikeOre(share, hit, requirement), 0)
    : 0;

describe(readReactionOreHit, () => {
  const IRON_CHUNK_ITEM_ID = 101_001;
  const CRYSTAL_CHUNK_ITEM_ID = 101_003;

  test("breaks an Iron Chunk with one Overloaded, and a Crystal Chunk with four that three leave standing", () => {
    expect.hasAssertions();

    const hit = readReactionOreHit(TransformativeReactionType.Overloaded);
    const crystalChunkRequirement = OreItemIdBreakPoiseMap[CRYSTAL_CHUNK_ITEM_ID];

    expect(strikeOreTimes(1, hit, OreItemIdBreakPoiseMap[IRON_CHUNK_ITEM_ID])).toBe(1);
    expect(strikeOreTimes(3, hit, crystalChunkRequirement)).toBeLessThan(1);
    expect(strikeOreTimes(4, hit, crystalChunkRequirement)).toBe(1);
  });

  test("gives no hit for a reaction whose own hit carries no poise", () => {
    expect.hasAssertions();

    expect(readReactionOreHit(TransformativeReactionType.Superconduct)).toBeUndefined();
  });
});

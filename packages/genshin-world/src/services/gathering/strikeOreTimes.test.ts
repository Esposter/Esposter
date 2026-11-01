import type { OreHit } from "#src/models/gathering/OreHit";
import type { OrePoiseRequirement } from "#src/models/gathering/OrePoiseRequirement";

import { strikeOre } from "#src/services/gathering/strikeOre";
import { describe } from "vitest";

// An ore's broken share once the same hit has struck it a number of times from whole, none without a hit
export const strikeOreTimes = (
  hitCount: number,
  hit: OreHit | undefined,
  requirement: OrePoiseRequirement | undefined,
): number =>
  hit && requirement
    ? Array.from({ length: hitCount }).reduce<number>((share) => strikeOre(share, hit, requirement), 0)
    : 0;

describe.todo("strikeOreTimes");

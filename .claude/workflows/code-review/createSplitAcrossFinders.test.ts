import { describe } from "vitest";

import type { Candidate } from "./models/Candidate";

/**
 * A `finderFor` that spreads `candidates` across the correctness angles, `perAngle` each, so a suite can hand a
 * run more candidates than any single finder's cap would let through. Every other finder answers with nothing.
 *
 * Written once because the split names the finders and the cap: spelled out per suite, a level retune or a finder
 * rename silently turns the extra candidates into a truncation the test then measures instead of what it is about.
 */
export const createSplitAcrossFinders =
  (candidates: Candidate[], perAngle: number) =>
  (label: string): Candidate[] =>
    label === "angle-A"
      ? candidates.slice(0, perAngle)
      : label === "angle-B"
        ? candidates.slice(perAngle, perAngle * 2)
        : [];

describe.todo("createSplitAcrossFinders");

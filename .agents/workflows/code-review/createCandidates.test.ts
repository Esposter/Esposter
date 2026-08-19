import { describe } from "vitest";

import type { Candidate } from "./models/Candidate";

import { CANDIDATE } from "./constants.test";

/**
 * `count` distinct candidates from the shared one, each on its own line so nothing dedupes them. Overrides are
 * applied after the line, and receive the index, so a suite that needs its candidates spread across files or
 * kinds states only that difference.
 */
export const createCandidates = (
  count: number,
  getOverrides: (index: number) => Partial<Candidate> = () => ({}),
): Candidate[] =>
  Array.from({ length: count }, (_, index) => ({ ...CANDIDATE, line: index + 1, ...getOverrides(index) }));

describe.todo("createCandidates");

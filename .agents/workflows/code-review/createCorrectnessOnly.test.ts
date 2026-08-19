import { describe } from "vitest";

import type { Candidate } from "./models/Candidate";

/**
 * A `finderFor` that answers the conventions finder with nothing and every correctness angle with whatever
 * `getCandidates` returns for it. Those copies carry kind `cleanup`, which is a separate row by design, so a suite
 * about correctness dedupe or resolution would otherwise be testing the cross-kind rule instead of the one it names.
 *
 * Written once because the guard names a finder: spelled out per suite, renaming that finder is a five-site sweep.
 */
export const createCorrectnessOnly =
  (getCandidates: (label: string) => Candidate[]) =>
  (label: string): Candidate[] =>
    label === "conventions" ? [] : getCandidates(label);

describe.todo("createCorrectnessOnly");

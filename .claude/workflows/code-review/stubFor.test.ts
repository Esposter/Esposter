import { describe } from "vitest";

import type { AgentStub } from "./models/AgentStub";
import type { StubOptions } from "./models/StubOptions";

import { SCOPE_DEFAULT } from "./constants.test";
import { createVerdict } from "./createVerdict.test";
import { getCandidateIndexes } from "./getCandidateIndexes.test";

/**
 * The default responder every suite builds on: Scope answers, one finder reports, every verifier CONFIRMS what
 * it is given, resolvers return whatever the test set, and the synthesizer is skipped so findings come through
 * the backfill path. A test overrides the one leg its invariant is about.
 */
export const stubFor = ({
  candidates = [],
  finderFor,
  resolution,
  scope = {},
  synthesis = null,
  verdictFor = () => ({}),
  verifierFor,
}: StubOptions): AgentStub => {
  let isFirstFinder = true;
  return (prompt, options) => {
    const label = options.label ?? "";
    if (label === "scope") return { ...SCOPE_DEFAULT, ...scope };
    if (label === "synthesize") return synthesis;
    if (label.startsWith("resolve:")) return resolution;
    if (label.startsWith("verify:")) {
      if (verifierFor?.(label) === null) return null;
      return {
        verdicts: getCandidateIndexes(prompt).map((index) => createVerdict(index, verdictFor(index, prompt))),
      };
    }
    if (finderFor) {
      const answer = finderFor(label);
      return answer === null ? null : { candidates: answer };
    }
    // Only the first finder reports by default: every finder sees the same territory here, so answering them all
    // Would make each test's candidate set arrive once per angle and bury the assertion under duplicates.
    if (isFirstFinder) {
      isFirstFinder = false;
      return { candidates };
    }
    return { candidates: [] };
  };
};

describe.todo("stubFor");

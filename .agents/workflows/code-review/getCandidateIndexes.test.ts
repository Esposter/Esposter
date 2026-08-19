import { describe } from "vitest";

/** The `[i]` labels a verifier prompt lists, so a stub answers per candidate without re-deriving the order. */
export const getCandidateIndexes = (prompt: string): number[] =>
  [...prompt.matchAll(/^\[(?<index>\d+)\] /gmu)].map((match) => Number(match.groups?.index));

describe.todo("getCandidateIndexes");

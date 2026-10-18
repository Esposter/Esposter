import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { mergeKitCandidateSources } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidateSources";
import { describe, expect, test } from "vitest";

// A candidate told apart from the others by its value alone
const candidateOf = (value: number): KitCandidate => ({
  provenance: { rule: KitRule.NamedHitList, source: KitSource.Rule },
  value,
});

describe(mergeKitCandidateSources, () => {
  test("a path's default is the named list's candidate, then the source's, the named hit's and the rule's", () => {
    expect.hasAssertions();

    const path = "burst.hits.length";

    expect(
      mergeKitCandidateSources({
        namedHitCandidateMap: new Map([[path, [candidateOf(3)]]]),
        namedListCandidateMap: new Map([[path, [candidateOf(1)]]]),
        ruleCandidateMap: new Map([[path, [candidateOf(4)]]]),
        sourceCandidateMap: new Map([[path, [candidateOf(2)]]]),
      }),
    ).toStrictEqual(new Map([[path, [candidateOf(1), candidateOf(2), candidateOf(3), candidateOf(4)]]]));
  });
});

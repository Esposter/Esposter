import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { mergeKitSourceCandidates } from "#src/services/genshinAssets/kits/candidates/mergeKitSourceCandidates";
import { describe, expect, test } from "vitest";

const gcsimOf = (value: number): KitCandidate => ({
  provenance: { file: "kit.go", line: 1, source: KitSource.Gcsim },
  value,
});
const standInOf = (value: number): KitCandidate => ({
  provenance: { cause: KitProvisionalCause.NoActionFile, file: "plunge.go", line: 1, source: KitSource.Gcsim },
  value,
});
const tableOf = (value: number): KitCandidate => ({
  provenance: { index: 0, label: "1-Hit DMG", proudSkillGroupId: 1, source: KitSource.Tables },
  value,
});
const wikiOf = (value: number): KitCandidate => ({
  provenance: { page: "Kit", revisionId: 1, row: 1, source: KitSource.Wiki },
  value,
});

describe(mergeKitSourceCandidates, () => {
  test("a field the tables hold defaults to the table's value, then gcsim's, then the wiki's", () => {
    expect.hasAssertions();

    const path = "normalAttacks.0.hits.0.multiplier";

    expect(
      mergeKitSourceCandidates({
        gcsimCandidateMap: new Map([[path, [gcsimOf(2)]]]),
        tableCandidateMap: new Map([[path, [tableOf(1)]]]),
        wikiCandidateMap: new Map([[path, [wikiOf(3)]]]),
      }),
    ).toStrictEqual(new Map([[path, [tableOf(1), gcsimOf(2), wikiOf(3)]]]));
  });

  test("a field the tables do not hold defaults to gcsim's value, then the wiki's", () => {
    expect.hasAssertions();

    const path = "normalAttacks.0.hits.0.hitmarkFrames";

    expect(
      mergeKitSourceCandidates({
        gcsimCandidateMap: new Map([[path, [gcsimOf(20)]]]),
        tableCandidateMap: new Map(),
        wikiCandidateMap: new Map([[path, [wikiOf(21)]]]),
      }),
    ).toStrictEqual(new Map([[path, [gcsimOf(20), wikiOf(21)]]]));
  });

  test("a path only the wiki gives takes the wiki's value", () => {
    expect.hasAssertions();

    const path = "normalAttacks.0.hits.0.poiseDamage";

    expect(
      mergeKitSourceCandidates({
        gcsimCandidateMap: new Map(),
        tableCandidateMap: new Map(),
        wikiCandidateMap: new Map([[path, [wikiOf(30)]]]),
      }),
    ).toStrictEqual(new Map([[path, [wikiOf(30)]]]));
  });

  test("a stand-in for a kit with no gcsim file defaults to the wiki's value first", () => {
    expect.hasAssertions();

    const path = "normalAttacks.0.hits.0.poiseDamage";

    expect(
      mergeKitSourceCandidates({
        gcsimCandidateMap: new Map([[path, [standInOf(150)]]]),
        tableCandidateMap: new Map(),
        wikiCandidateMap: new Map([[path, [wikiOf(100)]]]),
      }),
    ).toStrictEqual(new Map([[path, [wikiOf(100), standInOf(150)]]]));
  });
});

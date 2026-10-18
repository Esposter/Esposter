import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { classifyKitValue } from "#src/services/genshinAssets/kits/record/classifyKitValue";
import { describe, expect, test } from "vitest";

const createGcsim = (value: unknown): KitCandidate => ({
  provenance: { file: "attack.go", line: 16, source: KitSource.Gcsim },
  value,
});

describe(classifyKitValue, () => {
  const wiki: KitCandidate = {
    provenance: { page: "Dough-Fu", revisionId: 1677053, row: 1, source: KitSource.Wiki },
    value: 16,
  };
  const rule: KitCandidate = {
    provenance: { cause: KitProvisionalCause.NoPoiseSource, rule: KitRule.NoPoiseSource, source: KitSource.Rule },
    value: 0,
  };

  test.each<[string, unknown, KitCandidate[], KitCandidate[], boolean, KitOverlayEntry | undefined]>([
    ["the default already is it", 12, [createGcsim(12)], [createGcsim(14)], false, undefined],
    [
      "main gives it and the tag does not",
      14,
      [createGcsim(12)],
      [createGcsim(14)],
      false,
      { cause: KitProvisionalCause.ReadPastLicence, value: 14 },
    ],
    [
      "main gives it and the tag predates the character",
      14,
      [wiki],
      [createGcsim(14)],
      true,
      { cause: KitProvisionalCause.Unclassified, value: 14 },
    ],
    ["a later source gives it", 16, [createGcsim(12), wiki], [createGcsim(12)], false, { source: KitSource.Wiki }],
    [
      "every source disagrees",
      20,
      [createGcsim(12), wiki, rule],
      [],
      false,
      { cause: KitProvisionalCause.DiffersFromSource, value: 20 },
    ],
    ["only a rule disagrees", 20, [rule], [], false, { cause: KitProvisionalCause.Unclassified, value: 20 }],
  ])("classifies a value when %s", (_case, value, candidates, mainCandidates, isTagPredated, expected) => {
    expect.hasAssertions();

    expect(classifyKitValue(value, candidates, mainCandidates, isTagPredated, {})).toStrictEqual(expected);
  });

  test("reads a table reference as its value at every level, so a reference of another index with the same value is no difference", () => {
    expect.hasAssertions();

    const tableCandidate: KitCandidate = {
      provenance: { index: 4, label: "CD", proudSkillGroupId: 5532, source: KitSource.Tables },
      value: { index: 4, proudSkillGroupId: 5532 },
    };
    const talentMultiplierMap = { "5532": [{ level: 1, paramList: [0, 0, 0, 10, 10] }] };

    expect(
      classifyKitValue({ index: 3, proudSkillGroupId: 5532 }, [tableCandidate], [], false, talentMultiplierMap),
    ).toBeUndefined();
    expect(classifyKitValue(0, [tableCandidate], [], false, talentMultiplierMap)).toStrictEqual({
      cause: KitProvisionalCause.DiffersFromSource,
      value: 0,
    });
  });
});

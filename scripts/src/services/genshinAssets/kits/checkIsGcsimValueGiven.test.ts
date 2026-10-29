import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { checkIsGcsimValueGiven } from "#src/services/genshinAssets/kits/checkIsGcsimValueGiven";
import { describe, expect, test } from "vitest";

describe(checkIsGcsimValueGiven, () => {
  const gcsim: KitCandidate = { provenance: { file: "attack.go", line: 16, source: KitSource.Gcsim }, value: 1 };
  const noActionFile: KitCandidate = {
    provenance: { cause: KitProvisionalCause.NoActionFile, rule: KitRule.NoActionFile, source: KitSource.Rule },
    value: 1,
  };
  const wiki: KitCandidate = {
    provenance: { page: "Dough-Fu", revisionId: 1, row: 1, source: KitSource.Wiki },
    value: 1,
  };

  test.each<[string, KitCandidate[] | undefined, boolean]>([
    ["gcsim gives it", [gcsim], true],
    ["the shared no-action-file rule gives it", [noActionFile], true],
    ["only the wiki gives it", [wiki], false],
    ["nothing gives it", undefined, false],
  ])("checks whether gcsim gives a value when %s", (_case, candidates, expected) => {
    expect.hasAssertions();

    expect(checkIsGcsimValueGiven(candidates)).toBe(expected);
  });
});

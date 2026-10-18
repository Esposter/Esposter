import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { resolveKitValues } from "#src/services/genshinAssets/kits/record/resolveKitValues";
import { CombatTalent } from "genshin-world";
import { describe, expect, test } from "vitest";

const tables = {
  talentGroupIdMap: { [CombatTalent.ElementalBurst]: 2139, [CombatTalent.ElementalSkill]: 2138 },
  talentMultiplierMap: {},
} as unknown as KitTables;

const sourceCandidateMap = new Map<string, KitCandidate[]>([
  ["burst.hits.length", [{ provenance: { file: "burst.go", line: 60, source: KitSource.Gcsim }, value: 3 }]],
  [
    "hits.fieryRainArrows.0.multiplier",
    [{ provenance: { source: KitSource.Tables }, value: { index: 0, proudSkillGroupId: 2139 } }],
  ],
]);

describe(resolveKitValues, () => {
  test("empties the burst's hits list when a named list's hit joins to the burst's group through a Tables multiplier", () => {
    expect.hasAssertions();

    const { provenanceMap, valueMap } = resolveKitValues(sourceCandidateMap, {}, new Map(), tables);

    expect(valueMap.get("burst.hits.length")).toBe(0);
    expect(provenanceMap.get("burst.hits.length")).toStrictEqual({
      cause: KitProvisionalCause.NamedHitList,
      rule: "NamedHitList",
      source: KitSource.Rule,
    });
  });

  test("keeps the overlay's own length over the named list's", () => {
    expect.hasAssertions();

    const { valueMap } = resolveKitValues(
      sourceCandidateMap,
      { "burst.hits.length": { cause: "Unclassified", value: 2 } },
      new Map(),
      tables,
    );

    expect(valueMap.get("burst.hits.length")).toBe(2);
  });
});

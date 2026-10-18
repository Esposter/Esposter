import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { resolveKitValues } from "#src/services/genshinAssets/kits/record/resolveKitValues";
import { CombatTalent, Element } from "genshin-world";
import { describe, expect, test } from "vitest";

const TABLES = { element: Element.Geo, talentGroupIdMap: {} } as unknown as KitTables;
const OVERLAY: KitOverlay = { "burst.hits.0.element": { cause: KitProvisionalCause.NoGcsimUnit, value: "Rock" } };

const tables = {
  talentGroupIdMap: { [CombatTalent.ElementalBurst]: 2139, [CombatTalent.ElementalSkill]: 2138 },
  talentMultiplierMap: {},
} as unknown as KitTables;

const sourceCandidateMap = new Map<string, KitCandidate[]>([
  ["burst.hits.length", [{ provenance: { file: "burst.go", line: 60, source: KitSource.Gcsim }, value: 3 }]],
  [
    "hits.fieryRainArrows.0.multiplier",
    [
      {
        provenance: { index: 0, label: " ", proudSkillGroupId: 2139, source: KitSource.Tables },
        value: { index: 0, proudSkillGroupId: 2139 },
      },
    ],
  ],
]);

describe(resolveKitValues, () => {
  test("names an overlay value no gcsim folder gives as the unit gcsim does not model", () => {
    const { provenanceMap } = resolveKitValues(new Map(), OVERLAY, new Map(), new Map(), TABLES, false);
    expect(provenanceMap.get("burst.hits.0.element")).toStrictEqual({
      cause: KitProvisionalCause.NoGcsimUnit,
      source: KitSource.Overlay,
    });
  });

  test("refuses that cause for a character gcsim has a folder for, which can read the value", () => {
    expect(() => resolveKitValues(new Map(), OVERLAY, new Map(), new Map(), TABLES, true)).toThrow();
  });

  test("gives a burst's first hit the character's element where no source gives one, as a rule", () => {
    const { provenanceMap, valueMap } = resolveKitValues(
      new Map(),
      { "burst.hits.length": { cause: KitProvisionalCause.NoGcsimUnit, value: 1 } },
      new Map(),
      new Map(),
      TABLES,
      false,
    );
    expect(valueMap.get("burst.hits.0.element")).toBe(Element.Geo);
    expect(provenanceMap.get("burst.hits.0.element")).toStrictEqual({
      rule: KitRule.EnergyElement,
      source: KitSource.Rule,
    });
  });

  test("empties the burst's hits list when a named list's hit joins to the burst's group through a Tables multiplier", () => {
    expect.hasAssertions();

    const { provenanceMap, valueMap } = resolveKitValues(sourceCandidateMap, {}, new Map(), new Map(), tables, false);

    expect(valueMap.get("burst.hits.length")).toBe(0);
    expect(provenanceMap.get("burst.hits.length")).toStrictEqual({
      cause: KitProvisionalCause.NamedHitList,
      rule: KitRule.NamedHitList,
      source: KitSource.Rule,
    });
  });

  test("keeps the overlay's own length over the named list's", () => {
    expect.hasAssertions();

    const { valueMap } = resolveKitValues(
      sourceCandidateMap,
      { "burst.hits.length": { cause: "Unclassified", value: 2 } },
      new Map(),
      new Map(),
      tables,
      false,
    );

    expect(valueMap.get("burst.hits.length")).toBe(2);
  });
});

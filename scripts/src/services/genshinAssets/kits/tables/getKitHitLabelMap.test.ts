import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getKitHitLabelMap } from "#src/services/genshinAssets/kits/tables/getKitHitLabelMap";
import { describe, expect, test } from "vitest";

const labelMap: Pick<KitTables, "labelMap">["labelMap"] = new Map([
  [
    7332,
    [
      { indexes: [0], label: "Press DMG" },
      { indexes: [1], label: "Hold DMG" },
    ],
  ],
]);

describe(getKitHitLabelMap, () => {
  test("labels a skill hold's hit by the multiplier its overlay gives, where no gcsim candidate gives one", () => {
    expect.hasAssertions();

    const overlay: KitOverlay = {
      "skillHolds.0.action.hits.0.multiplier": {
        source: KitSource.Gcsim,
        value: { index: 1, proudSkillGroupId: 7332 },
      },
    };

    expect(getKitHitLabelMap(new Map(), { labelMap }, overlay)).toStrictEqual(
      new Map([["skillHolds.0.action.hits.0", "Hold DMG"]]),
    );
  });

  test("takes a skill's label from its gcsim candidate's multiplier, the overlay's only where no candidate gives one", () => {
    expect.hasAssertions();

    const candidateMap = new Map<string, KitCandidate[]>([
      [
        "skill.hits.0.multiplier",
        [
          {
            provenance: { file: "skill.go", line: 1, source: KitSource.Gcsim },
            value: { index: 0, proudSkillGroupId: 7332 },
          },
        ],
      ],
    ]);
    const overlay: KitOverlay = {
      "skill.hits.0.multiplier": { cause: "Unclassified", value: { index: 1, proudSkillGroupId: 7332 } },
    };

    expect(getKitHitLabelMap(candidateMap, { labelMap }, overlay)).toStrictEqual(
      new Map([["skill.hits.0", "Press DMG"]]),
    );
  });
});

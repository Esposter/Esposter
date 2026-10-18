import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getDonorKitCandidates } from "#src/services/genshinAssets/kits/record/getDonorKitCandidates";
import { describe, expect, test } from "vitest";

// Xingqiu's character id, declared here because the kit modules that export it are the world's, not the builder's
const XINGQIU_CHARACTER_ID = 10_000_025;

const strike = (hitmarkFrames: number) => ({ hits: [{ hitmarkFrames }] });

describe(getDonorKitCandidates, () => {
  test("gives Vesna's sixth strike the second hit of Xingqiu's fifth strike, the sixth strike remapped to the donor's fifth", () => {
    expect.hasAssertions();

    const overlay: KitOverlay = {
      "normalAttacks.5.hits.0.hitmarkFrames": {
        cause: KitProvisionalCause.BorrowedFromDonor,
        donor: { characterId: XINGQIU_CHARACTER_ID, path: "normalAttacks.4.hits.1.hitmarkFrames" },
      },
    };
    const donorRecordMap = new Map<number, unknown>([
      [
        XINGQIU_CHARACTER_ID,
        {
          normalAttacks: [
            strike(21),
            strike(22),
            strike(23),
            strike(24),
            { hits: [{ hitmarkFrames: 33 }, { hitmarkFrames: 34 }] },
          ],
        },
      ],
    ]);

    expect(getDonorKitCandidates(overlay, donorRecordMap).get("normalAttacks.5.hits.0.hitmarkFrames")).toStrictEqual([
      {
        provenance: {
          cause: KitProvisionalCause.BorrowedFromDonor,
          donor: XINGQIU_CHARACTER_ID,
          rule: KitRule.BorrowedFromDonor,
          source: KitSource.Rule,
        },
        value: 34,
      },
    ]);
  });

  test("fails a borrowed value whose donor's record has no value at the path it names", () => {
    expect.hasAssertions();

    const overlay: KitOverlay = {
      "normalAttacks.5.hits.0.hitmarkFrames": {
        cause: KitProvisionalCause.BorrowedFromDonor,
        donor: { characterId: XINGQIU_CHARACTER_ID, path: "normalAttacks.9.hits.0.hitmarkFrames" },
      },
    };
    const donorRecordMap = new Map<number, unknown>([[XINGQIU_CHARACTER_ID, { normalAttacks: [strike(21)] }]]);

    expect(() => getDonorKitCandidates(overlay, donorRecordMap)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: normalAttacks.5.hits.0.hitmarkFrames, borrows normalAttacks.9.hits.0.hitmarkFrames, which character 10000025 lacks]`,
    );
  });
});

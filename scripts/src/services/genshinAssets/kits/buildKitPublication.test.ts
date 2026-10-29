import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/shared/KitOverlay";
import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { buildKitPublication } from "#src/services/genshinAssets/kits/buildKitPublication";
import { SOURCE_CANDIDATE_MAP } from "#src/services/genshinAssets/kits/constants.test";
import { readKitOverlay } from "#src/services/genshinAssets/kits/readKitOverlay";
import { buildKitRecord } from "#src/services/genshinAssets/kits/record/buildKitRecord";
import { CombatTalent, GameDataset, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(buildKitPublication, () => {
  const HITMARK_PATH = "normalAttacks.0.hits.0.hitmarkFrames";
  // The same values, with the first strike's hitmark as another donor's gcsim gives it
  const DONOR_CANDIDATE_MAP = new Map<string, KitCandidate[]>([
    ...SOURCE_CANDIDATE_MAP,
    [HITMARK_PATH, [{ provenance: { file: "donor.go", line: 1, source: KitSource.Gcsim } as const, value: 99 }]],
  ]);
  const talentGroupIdMap = {
    [CombatTalent.ElementalBurst]: 1,
    [CombatTalent.ElementalSkill]: 1,
    [CombatTalent.NormalAttack]: 1,
  };
  // A kit built from those values, its tables as the build reads them, and the multiplier group its hits name
  const createTables = (characterId: number): KitTables => ({
    characterId,
    labelMap: new Map(),
    name: String(characterId),
    talentGroupIdMap,
    talentMultiplierMap: { 1: [{ level: 1, paramList: [1] }] },
    weaponType: WeaponType.Sword,
  });
  const borrowFrom = (characterId: number): KitOverlayEntry => ({
    cause: KitProvisionalCause.BorrowedFromDonor,
    donor: { characterId, path: HITMARK_PATH },
  });
  // A kit built from those values under its overlay, published as they build it or yet to be published
  const createInput = (
    characterId: number,
    isPublished: boolean,
    overlay: KitOverlay = {},
    sourceCandidateMap: Map<string, KitCandidate[]> = SOURCE_CANDIDATE_MAP,
  ): KitInput => {
    const tables = createTables(characterId);
    return {
      characterId,
      name: String(characterId),
      namedHitCandidateMap: new Map(),
      notes: [],
      overlay,
      overlayName: "",
      ...(isPublished && {
        publishedRecord: buildKitRecord(SOURCE_CANDIDATE_MAP, {}, new Map(), new Map(), tables, true).record,
      }),
      sourceCandidateMap,
      tables,
    };
  };

  test("builds a kit yet to be published that the publish names, beside the published ones", async () => {
    expect.hasAssertions();

    const { indexes } = await buildKitPublication([createInput(1, true), createInput(2, false)], [2]);

    expect(Object.keys(indexes[GameDataset.Kits] ?? {})).toStrictEqual(["1", "2"]);
  });

  test("fails on a kit yet to be published that the publish does not name", async () => {
    expect.hasAssertions();

    await expect(buildKitPublication([createInput(1, true), createInput(2, false)])).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Create, name: buildKitPublication, the records differ from their published ones, so name each kit meant to change in --only:
      2: has no published kit]
    `);
  });

  test("names the kit and the record path of a talent reference its sources do not read", async () => {
    expect.hasAssertions();

    // Amber's first overlay entry no source gives is her first Fiery Rain arrow's gcsim multiplier, a choice held until
    // The named-hit join has read the record, so the refusal names that multiplier's path
    await expect(
      buildKitPublication([{ ...createInput(1, false, readKitOverlay("amber")), name: "Amber", overlayName: "amber" }]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: Amber, its record cannot be built: Invalid operation: Read, name: hits.fieryRainArrows.0.multiplier, has no Gcsim value for the overlay to choose]`,
    );
  });

  test("builds a borrower after its donor, so the value it borrows is the donor's own resolved one", async () => {
    expect.hasAssertions();

    const { indexes } = await buildKitPublication(
      [createInput(1, false, { [HITMARK_PATH]: borrowFrom(2) }), createInput(2, false, {}, DONOR_CANDIDATE_MAP)],
      [1, 2],
    );

    expect(indexes[GameDataset.Kits]).toHaveProperty(["1", "normalAttacks", 0, "hits", 0, "hitmarkFrames"], 99);
    expect(indexes[GameDataset.KitSources]).toHaveProperty(["1", "values", HITMARK_PATH], {
      cause: KitProvisionalCause.BorrowedFromDonor,
      donor: 2,
      rule: KitRule.BorrowedFromDonor,
      source: KitSource.Rule,
    });
  });

  test("fails a chain of donors that borrows back to a kit already being built", async () => {
    expect.hasAssertions();

    await expect(
      buildKitPublication(
        [
          createInput(1, false, { [HITMARK_PATH]: borrowFrom(2) }),
          createInput(2, false, { [HITMARK_PATH]: borrowFrom(1) }),
        ],
        [1, 2],
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: 1, its record cannot be built: Invalid operation: Read, name: 2, borrows from 1, which borrows back to a kit already being built]`,
    );
  });

  test("publishes a multiplier without the constellation its overlay joins it by", async () => {
    expect.hasAssertions();

    // Gcsim's multiplier for the first strike names the constellation its talent variable reads at
    const sourceCandidateMap = new Map<string, KitCandidate[]>([
      ...SOURCE_CANDIDATE_MAP,
      [
        "normalAttacks.0.hits.0.multiplier",
        [
          {
            provenance: { file: "kit.go", line: 1, source: KitSource.Gcsim },
            value: { constellation: 4, index: 0, proudSkillGroupId: 1 },
          },
        ],
      ],
    ]);

    const { indexes } = await buildKitPublication([createInput(1, false, {}, sourceCandidateMap)], [1]);

    expect(indexes[GameDataset.Kits]).toHaveProperty(["1", "normalAttacks", 0, "hits", 0, "multiplier"], {
      index: 0,
      proudSkillGroupId: 1,
    });
  });

  // Freminet's id, whose behaviour module reads Spiritbreath Thorn by name
  const FREMINET_CHARACTER_ID = 10_000_085;

  test("fails the publish naming a kit whose behaviour reads a value its record lacks", async () => {
    expect.hasAssertions();

    await expect(buildKitPublication([createInput(FREMINET_CHARACTER_ID, false)], [FREMINET_CHARACTER_ID])).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Create, name: buildKitPublication, the records differ from their published ones, so name each kit meant to change in --only:
      10000085: its kit cannot be built: Invalid operation: Read, name: hits.spiritbreathThorn, is not in its kit's record]
    `);
  });
});

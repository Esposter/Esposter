import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitActionRecord, KitHitRecord, KitRecord } from "genshin-world";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { buildKitPublication } from "#src/services/genshinAssets/kits/buildKitPublication";
import { buildKitRecord } from "#src/services/genshinAssets/kits/record/buildKitRecord";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { CombatTalent, GameDataset, KitPlunge, KitTargeting, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(buildKitPublication, () => {
  const HIT_RECORD: KitHitRecord = {
    area: { angle: 2 * Math.PI, height: 2, radius: 1 },
    hitmarkFrames: 12,
    multiplier: { index: 0, proudSkillGroupId: 1 },
    poiseDamage: 0,
  };
  const ACTION_RECORD: KitActionRecord = { animationFrames: 30, hits: [HIT_RECORD], targeting: KitTargeting.Strike };
  const RECORD: KitRecord = {
    burst: ACTION_RECORD,
    burstCooldownSeconds: 15,
    chargedAttack: ACTION_RECORD,
    chargedAttackStamina: 20,
    normalAttacks: [ACTION_RECORD],
    plungeCollision: HIT_RECORD,
    plunges: { [KitPlunge.High]: ACTION_RECORD, [KitPlunge.Low]: ACTION_RECORD },
    skill: ACTION_RECORD,
    skillCooldownSeconds: 6,
    skillHolds: [],
  };
  const HITMARK_PATH = "normalAttacks.0.hits.0.hitmarkFrames";
  // Every value of the record as gcsim gives it, each at a line of its own
  const SOURCE_CANDIDATE_MAP = new Map(
    Array.from(flattenKitValues(RECORD), ([path, value], index) => [
      path,
      [{ provenance: { file: "kit.go", line: index + 1, source: KitSource.Gcsim } as const, value }],
    ]),
  );
  // The same values, with the first strike's hitmark as another donor's gcsim gives it
  const DONOR_CANDIDATE_MAP = new Map([
    ...SOURCE_CANDIDATE_MAP,
    [HITMARK_PATH, [{ provenance: { file: "donor.go", line: 1, source: KitSource.Gcsim } as const, value: 99 }]],
  ]);
  const talentGroupIdMap = {
    [CombatTalent.ElementalBurst]: 1,
    [CombatTalent.ElementalSkill]: 1,
    [CombatTalent.NormalAttack]: 1,
  };
  // A kit built from those values, its tables as the build reads them
  const createTables = (characterId: number): KitTables => ({
    characterId,
    labelMap: new Map(),
    name: String(characterId),
    talentGroupIdMap,
    talentMultiplierMap: {},
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
    sourceCandidateMap = SOURCE_CANDIDATE_MAP,
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

  test("builds a kit yet to be published that the publish names, beside the published ones", () => {
    expect.hasAssertions();

    const { indexes } = buildKitPublication([createInput(1, true), createInput(2, false)], [2]);

    expect(Object.keys(indexes[GameDataset.Kits] ?? {})).toStrictEqual(["1", "2"]);
  });

  test("fails on a kit yet to be published that the publish does not name", () => {
    expect.hasAssertions();

    expect(() => buildKitPublication([createInput(1, true), createInput(2, false)]))
      .toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Create, name: buildKitPublication, the records differ from their published ones, so name each kit meant to change in --only:
      2: has no published kit]
    `);
  });
  test("names the kit and the record path of a talent reference its sources do not read", () => {
    expect.hasAssertions();

    // Amber's first overlay entry sourced from gcsim is a reference to a talent group none of the sources give
    expect(() =>
      buildKitPublication([{ ...createInput(1, false), name: "Amber", overlayName: "amber" }]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: Amber, its record cannot be built: Invalid operation: Read, name: hits.fieryRainArrows.0.multiplier, has no Gcsim value for the overlay to choose]`,
    );
  });

  test("builds a borrower after its donor, so the value it borrows is the donor's own resolved one", () => {
    expect.hasAssertions();

    const { indexes } = buildKitPublication(
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

  test("fails a chain of donors that borrows back to a kit already being built", () => {
    expect.hasAssertions();

    expect(() =>
      buildKitPublication(
        [
          createInput(1, false, { [HITMARK_PATH]: borrowFrom(2) }),
          createInput(2, false, { [HITMARK_PATH]: borrowFrom(1) }),
        ],
        [1, 2],
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 2, borrows from 1, which borrows back to a kit already being built]`,
    );
  });
});

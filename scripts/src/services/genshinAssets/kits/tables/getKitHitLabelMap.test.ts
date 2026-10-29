import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTableLabel } from "#src/models/genshinAssets/kits/tables/KitTableLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { getKitHitLabelMap } from "#src/services/genshinAssets/kits/tables/getKitHitLabelMap";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(getKitHitLabelMap, () => {
  const SKILL_GROUP_ID = 12_632;
  const PRESS_AND_HOLD_GROUP_ID = 7332;

  const createCandidate = (index: number): KitCandidate => ({
    provenance: { index, label: "", proudSkillGroupId: SKILL_GROUP_ID, source: KitSource.Tables },
    value: { index, proudSkillGroupId: SKILL_GROUP_ID },
  });

  const createTables = (labelMap: Map<number, KitTableLabel[]>): KitTables => ({
    characterId: 10_000_126,
    labelMap,
    name: "Test",
    talentGroupIdMap: {
      [CombatTalent.ElementalBurst]: 0,
      [CombatTalent.ElementalSkill]: SKILL_GROUP_ID,
      [CombatTalent.NormalAttack]: 0,
    },
    talentMultiplierMap: {},
    weaponType: WeaponType.Catalyst,
  });

  const pressAndHoldLabelMap: Pick<KitTables, "labelMap">["labelMap"] = new Map([
    [
      PRESS_AND_HOLD_GROUP_ID,
      [
        { indexes: [0], label: "Press DMG" },
        { indexes: [1], label: "Hold DMG" },
      ],
    ],
  ]);

  test("maps a stance's hit and a hold's hit to the table labels their multipliers name, as a skill's hit is mapped", () => {
    expect.hasAssertions();

    const hitLabelMap = getKitHitLabelMap(
      new Map([
        ["skill.hits.0.multiplier", [createCandidate(0)]],
        ["skillHolds.0.action.hits.0.multiplier", [createCandidate(3)]],
        ["stances.lunarPhaseShift.normalAttacks.0.hits.0.multiplier", [createCandidate(5)]],
      ]),
      createTables(
        new Map([
          [
            SKILL_GROUP_ID,
            [
              { indexes: [0], label: "Skill DMG" },
              { indexes: [5], label: "Lunar Phase Shift 1-Hit DMG" },
              { indexes: [3], label: "Hold DMG" },
            ],
          ],
        ]),
      ),
      {},
    );

    expect(hitLabelMap).toStrictEqual(
      new Map([
        ["skill.hits.0", { label: "Skill DMG", proudSkillGroupId: SKILL_GROUP_ID }],
        ["skillHolds.0.action.hits.0", { label: "Hold DMG", proudSkillGroupId: SKILL_GROUP_ID }],
        [
          "stances.lunarPhaseShift.normalAttacks.0.hits.0",
          { label: "Lunar Phase Shift 1-Hit DMG", proudSkillGroupId: SKILL_GROUP_ID },
        ],
      ]),
    );
  });

  test("labels a skill hold's hit by the multiplier its overlay gives, where no gcsim candidate gives one", () => {
    expect.hasAssertions();

    const overlay: KitOverlay = {
      "skillHolds.0.action.hits.0.multiplier": {
        source: KitSource.Gcsim,
        value: { index: 1, proudSkillGroupId: PRESS_AND_HOLD_GROUP_ID },
      },
    };

    expect(getKitHitLabelMap(new Map(), createTables(pressAndHoldLabelMap), overlay)).toStrictEqual(
      new Map([["skillHolds.0.action.hits.0", { label: "Hold DMG", proudSkillGroupId: PRESS_AND_HOLD_GROUP_ID }]]),
    );
  });

  test("labels a named hit by the multiplier its overlay gives, where no gcsim candidate gives one", () => {
    expect.hasAssertions();

    const overlay: KitOverlay = {
      "hits.judgement.0.multiplier": {
        source: KitSource.Gcsim,
        value: { index: 0, proudSkillGroupId: PRESS_AND_HOLD_GROUP_ID },
      },
    };

    expect(getKitHitLabelMap(new Map(), createTables(pressAndHoldLabelMap), overlay)).toStrictEqual(
      new Map([["hits.judgement.0", { label: "Press DMG", proudSkillGroupId: PRESS_AND_HOLD_GROUP_ID }]]),
    );
  });

  test("takes a skill's label from its overlay's multiplier over its gcsim candidate's, where both give one", () => {
    expect.hasAssertions();

    const candidateMap = new Map<string, KitCandidate[]>([
      [
        "skill.hits.0.multiplier",
        [
          {
            provenance: { file: "skill.go", line: 1, source: KitSource.Gcsim },
            value: { index: 0, proudSkillGroupId: PRESS_AND_HOLD_GROUP_ID },
          },
        ],
      ],
    ]);
    const overlay: KitOverlay = {
      "skill.hits.0.multiplier": {
        cause: KitProvisionalCause.Unclassified,
        value: { index: 1, proudSkillGroupId: PRESS_AND_HOLD_GROUP_ID },
      },
    };

    expect(getKitHitLabelMap(candidateMap, createTables(pressAndHoldLabelMap), overlay)).toStrictEqual(
      new Map([["skill.hits.0", { label: "Hold DMG", proudSkillGroupId: PRESS_AND_HOLD_GROUP_ID }]]),
    );
  });

  test("labels a burst hit by its overlay's multiplier where that differs from its gcsim candidate's", () => {
    expect.hasAssertions();

    const candidateMap = new Map<string, KitCandidate[]>([
      [
        "burst.hits.0.multiplier",
        [
          {
            provenance: { file: "burst.go", line: 1, source: KitSource.Gcsim },
            value: { index: 0, proudSkillGroupId: PRESS_AND_HOLD_GROUP_ID },
          },
        ],
      ],
    ]);
    const overlay: KitOverlay = {
      "burst.hits.0.multiplier": {
        cause: KitProvisionalCause.Unclassified,
        value: { index: 1, proudSkillGroupId: PRESS_AND_HOLD_GROUP_ID },
      },
    };

    expect(getKitHitLabelMap(candidateMap, createTables(pressAndHoldLabelMap), overlay)).toStrictEqual(
      new Map([["burst.hits.0", { label: "Hold DMG", proudSkillGroupId: PRESS_AND_HOLD_GROUP_ID }]]),
    );
  });

  test("takes no label for a burst hit at or past the length its list's overlay sets", () => {
    expect.hasAssertions();

    const candidateMap = new Map<string, KitCandidate[]>([
      [
        "burst.hits.3.multiplier",
        [
          {
            provenance: { file: "burst.go", line: 1, source: KitSource.Gcsim },
            value: { index: 0, proudSkillGroupId: PRESS_AND_HOLD_GROUP_ID },
          },
        ],
      ],
    ]);
    const overlay: KitOverlay = { "burst.hits.length": { cause: KitProvisionalCause.Unclassified, value: 3 } };

    expect(getKitHitLabelMap(candidateMap, createTables(pressAndHoldLabelMap), overlay)).toStrictEqual(new Map());
  });

  test("takes no label for a skill hit whose list a named list's hits empty, so the named hit keeps the label", () => {
    expect.hasAssertions();

    const overlay: KitOverlay = {
      "hits.dragonTicks.0.multiplier": {
        cause: KitProvisionalCause.Unsourced,
        value: { index: 0, proudSkillGroupId: SKILL_GROUP_ID },
      },
    };

    expect(
      getKitHitLabelMap(
        new Map([["skill.hits.0.multiplier", [createCandidate(0)]]]),
        createTables(new Map([[SKILL_GROUP_ID, [{ indexes: [0], label: "Dragon DMG" }]]])),
        overlay,
      ),
    ).toStrictEqual(new Map([["hits.dragonTicks.0", { label: "Dragon DMG", proudSkillGroupId: SKILL_GROUP_ID }]]));
  });

  test("labels a follow-up's, a plunge variant's, an action's and a hit field's hits by the multipliers they name", () => {
    expect.hasAssertions();

    const candidate = createCandidate(0);
    const candidateMap = new Map<string, KitCandidate[]>([
      ["actions.kesagiris.0.hits.0.multiplier", [candidate]],
      ["hitFields.lightningDischarge.multiplier", [candidate]],
      ["plungeVariants.0.hits.0.multiplier", [candidate]],
      ["skillChain.followUps.0.hits.0.multiplier", [candidate]],
    ]);

    expect(
      getKitHitLabelMap(
        candidateMap,
        createTables(new Map([[SKILL_GROUP_ID, [{ indexes: [0], label: "Skill DMG" }]]])),
        {},
      ),
    ).toStrictEqual(
      new Map([
        ["actions.kesagiris.0.hits.0", { label: "Skill DMG", proudSkillGroupId: SKILL_GROUP_ID }],
        ["hitFields.lightningDischarge", { label: "Skill DMG", proudSkillGroupId: SKILL_GROUP_ID }],
        ["plungeVariants.0.hits.0", { label: "Skill DMG", proudSkillGroupId: SKILL_GROUP_ID }],
        ["skillChain.followUps.0.hits.0", { label: "Skill DMG", proudSkillGroupId: SKILL_GROUP_ID }],
      ]),
    );
  });

  test("takes no label for a normal attack page's strike, charged attack, plunge or collision, which take their rows by title", () => {
    expect.hasAssertions();

    const candidate = createCandidate(0);
    const candidateMap = new Map<string, KitCandidate[]>([
      ["chargedAttack.hits.0.multiplier", [candidate]],
      ["normalAttacks.0.hits.0.multiplier", [candidate]],
      ["plungeCollision.multiplier", [candidate]],
      ["plunges.high.hits.0.multiplier", [candidate]],
    ]);

    expect(
      getKitHitLabelMap(
        candidateMap,
        createTables(new Map([[SKILL_GROUP_ID, [{ indexes: [0], label: "Skill DMG" }]]])),
        {},
      ),
    ).toStrictEqual(new Map());
  });
});

import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { WikiTalentPage } from "#src/models/genshinAssets/kits/wiki/WikiTalentPage";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { WIKI_FIXTURE_DIRECTORY } from "#src/services/genshinAssets/kits/wiki/constants.test";
import { getWikiKitCandidates } from "#src/services/genshinAssets/kits/wiki/getWikiKitCandidates";
import { parseAdvancedProperties } from "#src/services/genshinAssets/kits/wiki/parseAdvancedProperties";
import { CombatTalent, InternalCooldownTag, KitPlunge, WeaponType } from "genshin-world";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const readPage = (title: string, combatTalent: CombatTalent, revisionId: number): WikiTalentPage => ({
  combatTalent,
  properties: parseAdvancedProperties(readFileSync(join(WIKI_FIXTURE_DIRECTORY, `${title}.wikitext`), "utf8")),
  revisionId,
  title,
});
// A row's values by their paths, as a strike's or a hit the wiki gives no ICD tag writes them
const createStrikeEntries = (
  path: string,
  poise: number,
  internalCooldownTag = InternalCooldownTag.NormalAttack,
): [string, unknown][] => [
  [`${path}.poiseDamage`, poise],
  [`${path}.internalCooldownTag`, internalCooldownTag],
];
const createUntaggedEntries = (path: string, poise: number, gauge?: number): [string, unknown][] => [
  [`${path}.poiseDamage`, poise],
  [`${path}.internalCooldownTag`, undefined],
  ...(gauge === undefined ? [] : [[`${path}.gauge`, gauge] satisfies [string, unknown]]),
];
// Each path's candidate values, in the order the reader gives them
const readCandidateValues = (candidateMap: ReadonlyMap<string, KitCandidate[]>) =>
  Object.fromEntries(Array.from(candidateMap, ([path, candidates]) => [path, candidates.map(({ value }) => value)]));

describe(getWikiKitCandidates, () => {
  const BURST_GROUP_ID = 1;
  const SKILL_GROUP_ID = 2;
  const NORMAL_ATTACK_GROUP_ID = 3;
  const talentGroupIdMap: Record<CombatTalent, number> = {
    [CombatTalent.ElementalBurst]: BURST_GROUP_ID,
    [CombatTalent.ElementalSkill]: SKILL_GROUP_ID,
    [CombatTalent.NormalAttack]: NORMAL_ATTACK_GROUP_ID,
  };

  test("keeps a row's poise where its internal cooldown tag is one the enum does not name, and writes no tag", () => {
    expect.hasAssertions();

    const varesa: WikiTalentPage = {
      combatTalent: CombatTalent.ElementalSkill,
      properties: [{ internalCooldownTag: "Varesa General", poise: 50, row: 1, title: "Rush DMG" }],
      revisionId: 1,
      title: "Varesa",
    };
    const candidateMap = getWikiKitCandidates(
      [varesa],
      { name: "Test", talentGroupIdMap, weaponType: WeaponType.Catalyst },
      new Map([["skill.hits.0", { label: "Rush DMG", proudSkillGroupId: SKILL_GROUP_ID }]]),
    );

    expect(readCandidateValues(candidateMap)).toStrictEqual({ "skill.hits.0.poiseDamage": [50] });
  });

  test("joins a skill hold's hit to its row by the label its multiplier gives, as the skill's hits are", () => {
    expect.hasAssertions();

    const nahida: WikiTalentPage = {
      combatTalent: CombatTalent.ElementalSkill,
      properties: [
        { poise: 75, row: 1, title: "Press DMG" },
        { poise: 100, row: 2, title: "Hold DMG" },
      ],
      revisionId: 1,
      title: "Nahida",
    };
    const candidateMap = getWikiKitCandidates(
      [nahida],
      { name: "Test", talentGroupIdMap, weaponType: WeaponType.Catalyst },
      new Map([["skillHolds.0.action.hits.0", { label: "Hold DMG", proudSkillGroupId: SKILL_GROUP_ID }]]),
    );

    expect(readCandidateValues(candidateMap)).toStrictEqual({ "skillHolds.0.action.hits.0.poiseDamage": [100] });
  });

  test("joins Xiangling's rows by their titles, the skill's and burst's by the words their table labels share", () => {
    expect.hasAssertions();

    const doughFu = readPage("Dough-Fu", CombatTalent.NormalAttack, 1677053);
    const pyronado = readPage("Pyronado", CombatTalent.ElementalBurst, 2066383);
    const candidateMap = getWikiKitCandidates(
      [doughFu, pyronado],
      { name: "Test", talentGroupIdMap, weaponType: WeaponType.Polearm },
      new Map([
        ["burst.hits.0", { label: "1-Hit Swing DMG", proudSkillGroupId: BURST_GROUP_ID }],
        ["burst.hits.3", { label: "Pyronado DMG", proudSkillGroupId: BURST_GROUP_ID }],
      ]),
    );

    expect(readCandidateValues(candidateMap)).toStrictEqual(
      Object.fromEntries(
        [
          ...createStrikeEntries("normalAttacks.0.hits.0", 16),
          ...createStrikeEntries("normalAttacks.1.hits.0", 19.2),
          ...createStrikeEntries("normalAttacks.2.hits.0", 19.2),
          ...createStrikeEntries("normalAttacks.2.hits.1", 20),
          ...createStrikeEntries("normalAttacks.3.hits.0", 19.2),
          ...createStrikeEntries("normalAttacks.3.hits.1", 19.2),
          ...createStrikeEntries("normalAttacks.3.hits.2", 19.2),
          ...createStrikeEntries("normalAttacks.3.hits.3", 12.8),
          ...createStrikeEntries("normalAttacks.4.hits.0", 71.2),
          ...createStrikeEntries("chargedAttack.hits.0", 120, InternalCooldownTag.ChargedAttack),
          ...createUntaggedEntries("plungeCollision", 25, 0),
          ...createUntaggedEntries(`plunges.${KitPlunge.Low}.hits.0`, 100),
          ...createUntaggedEntries(`plunges.${KitPlunge.High}.hits.0`, 150),
          ...createStrikeEntries("burst.hits.0", 30, InternalCooldownTag.ElementalBurst),
          ["burst.hits.0.gauge", 1],
          ...createUntaggedEntries("burst.hits.3", 30, 1),
        ].map(([path, value]) => [path, [value]]),
      ),
    );
    expect(candidateMap.get("burst.hits.3.poiseDamage")?.[0]?.provenance).toStrictEqual({
      page: "Pyronado",
      revisionId: 2066383,
      row: 2,
      source: KitSource.Wiki,
    });
  });

  test("names a skill row's tag by the member its wiki name is given, where the wiki names a character's own", () => {
    expect.hasAssertions();

    const candidateMap = getWikiKitCandidates(
      [
        {
          combatTalent: CombatTalent.ElementalSkill,
          properties: [{ internalCooldownTag: "Vesna Elemental Skill Start", poise: 0, row: 1, title: "Skill DMG" }],
          revisionId: 1,
          title: "Vesna",
        },
      ],
      { name: "Test", talentGroupIdMap, weaponType: WeaponType.Claymore },
      new Map([["skill.hits.0", { label: "Skill DMG", proudSkillGroupId: SKILL_GROUP_ID }]]),
    );

    expect(candidateMap.get("skill.hits.0.internalCooldownTag")?.map(({ value }) => value)).toStrictEqual([
      InternalCooldownTag.VesnaElementalSkillStart,
    ]);
  });

  test("joins a stance's hit and a hold's hit to their rows by the words their labels share, as the skill's own hits are", () => {
    expect.hasAssertions();

    const candidateMap = getWikiKitCandidates(
      [
        {
          combatTalent: CombatTalent.ElementalSkill,
          properties: [
            {
              gauge: 1,
              internalCooldownTag: "none",
              poise: 0,
              row: 1,
              title: "Phantasm Performance 1-Hit DMG (Nefer)",
            },
            { poise: 20, row: 2, title: "Hold DMG" },
          ],
          revisionId: 1,
          title: "Nefer",
        },
      ],
      { name: "Test", talentGroupIdMap, weaponType: WeaponType.Catalyst },
      new Map([
        ["skillHolds.0.action.hits.0", { label: "Hold DMG", proudSkillGroupId: SKILL_GROUP_ID }],
        [
          "stances.phantasmPerformance.chargedAttack.hits.0",
          { label: "Phantasm Performance 1-Hit DMG (Nefer)", proudSkillGroupId: SKILL_GROUP_ID },
        ],
      ]),
    );

    expect(
      candidateMap.get("stances.phantasmPerformance.chargedAttack.hits.0.poiseDamage")?.map(({ value }) => value),
    ).toStrictEqual([0]);
    expect(
      candidateMap.get("stances.phantasmPerformance.chargedAttack.hits.0.gauge")?.map(({ value }) => value),
    ).toStrictEqual([1]);
    expect(candidateMap.get("skillHolds.0.action.hits.0.poiseDamage")?.map(({ value }) => value)).toStrictEqual([20]);
  });

  test("joins a named hit whose multiplier's group is the normal attack's to the normal attack page's row titled as its label", () => {
    expect.hasAssertions();

    const neuvillette: WikiTalentPage = {
      combatTalent: CombatTalent.NormalAttack,
      properties: [{ poise: 25, row: 1, title: "Charged Attack: Equitable Judgment" }],
      revisionId: 1,
      title: "Neuvillette",
    };
    const candidateMap = getWikiKitCandidates(
      [neuvillette],
      { name: "Test", talentGroupIdMap, weaponType: WeaponType.Catalyst },
      new Map([
        [
          "hits.judgement.0",
          { label: "Charged Attack: Equitable Judgment", proudSkillGroupId: NORMAL_ATTACK_GROUP_ID },
        ],
      ]),
    );

    expect(readCandidateValues(candidateMap)).toStrictEqual({ "hits.judgement.0.poiseDamage": [25] });
  });

  test("gives a named hit no row a slot hit on its page takes, where the named hit reuses that slot hit's label", () => {
    expect.hasAssertions();

    const chongyun: WikiTalentPage = {
      combatTalent: CombatTalent.ElementalSkill,
      properties: [{ poise: 2, row: 1, title: "Blade DMG" }],
      revisionId: 1,
      title: "Chongyun",
    };
    const candidateMap = getWikiKitCandidates(
      [chongyun],
      { name: "Test", talentGroupIdMap, weaponType: WeaponType.Claymore },
      new Map([
        ["hits.rimechaserBlade.0", { label: "Blade DMG", proudSkillGroupId: SKILL_GROUP_ID }],
        ["skill.hits.0", { label: "Blade DMG", proudSkillGroupId: SKILL_GROUP_ID }],
      ]),
    );

    expect(readCandidateValues(candidateMap)).toStrictEqual({ "skill.hits.0.poiseDamage": [2] });
  });

  test("gives a strike the poise its two bracketed rows agree on", () => {
    expect.hasAssertions();

    const zhongli: WikiTalentPage = {
      combatTalent: CombatTalent.NormalAttack,
      properties: [
        { poise: 33.76, row: 1, title: "Normal Attack 1-Hit (Target Within 2m)" },
        { poise: 33.76, row: 2, title: "Normal Attack 1-Hit (Target Not Within 2m)" },
      ],
      revisionId: 1,
      title: "Zhongli",
    };
    const candidateMap = getWikiKitCandidates(
      [zhongli],
      { name: "Test", talentGroupIdMap, weaponType: WeaponType.Polearm },
      new Map(),
    );

    expect(readCandidateValues(candidateMap)).toStrictEqual({ "normalAttacks.0.hits.0.poiseDamage": [33.76] });
  });

  test("a slot takes its exact row over a bracketed variant", () => {
    expect.hasAssertions();

    const tengu: WikiTalentPage = {
      combatTalent: CombatTalent.NormalAttack,
      properties: [
        { poise: 20, row: 8, title: "Fully-Charged Aimed Shot" },
        { poise: 60, row: 9, title: "Fully-Charged Aimed Shot (Hit Weak Spot)" },
      ],
      revisionId: 1,
      title: "Tengu Bowmanship",
    };
    const candidateMap = getWikiKitCandidates(
      [tengu],
      { name: "Test", talentGroupIdMap, weaponType: WeaponType.Bow },
      new Map(),
    );

    expect(readCandidateValues(candidateMap)).toStrictEqual({ "chargedAttack.hits.0.poiseDamage": [20] });
  });

  test("gives a named hit the poise its two found rows agree on, citing the first row", () => {
    expect.hasAssertions();

    const chongyun: WikiTalentPage = {
      combatTalent: CombatTalent.ElementalSkill,
      properties: [
        { poise: 30, row: 1, title: "Slash DMG (First Hit)" },
        { poise: 30, row: 2, title: "Slash DMG (Subsequent Hits)" },
      ],
      revisionId: 1,
      title: "Chongyun",
    };
    const candidateMap = getWikiKitCandidates(
      [chongyun],
      { name: "Test", talentGroupIdMap, weaponType: WeaponType.Claymore },
      new Map([["hits.slash.0", { label: "Slash DMG", proudSkillGroupId: SKILL_GROUP_ID }]]),
    );

    expect(candidateMap.get("hits.slash.0.poiseDamage")).toStrictEqual([
      { provenance: { page: "Chongyun", revisionId: 1, row: 1, source: KitSource.Wiki }, value: 30 },
    ]);
  });

  test("gives a named hit no poise where its two found rows disagree on it", () => {
    expect.hasAssertions();

    const nahida: WikiTalentPage = {
      combatTalent: CombatTalent.ElementalSkill,
      properties: [
        { poise: 20, row: 1, title: "Hold DMG" },
        { poise: 100, row: 2, title: "Hold DMG" },
      ],
      revisionId: 1,
      title: "Nahida",
    };
    const candidateMap = getWikiKitCandidates(
      [nahida],
      { name: "Test", talentGroupIdMap, weaponType: WeaponType.Catalyst },
      new Map([["hits.hold.0", { label: "Hold DMG", proudSkillGroupId: SKILL_GROUP_ID }]]),
    );

    expect(readCandidateValues(candidateMap)).toStrictEqual({});
  });

  test("gives a traveler only its own form's block's poise, where the other form's block disagrees", () => {
    expect.hasAssertions();

    const traveler: WikiTalentPage = {
      combatTalent: CombatTalent.NormalAttack,
      properties: parseAdvancedProperties(
        [
          ";Aether",
          "{{Advanced Properties",
          "|title   = Normal Attack 1-Hit",
          "|poise   = 41.4",
          "}}",
          ";Lumine",
          "{{Advanced Properties",
          "|title   = Normal Attack 1-Hit",
          "|poise   = 40.5",
          "}}",
        ].join("\n"),
      ),
      revisionId: 1,
      title: "Foreign Ironwind",
    };
    const candidateMap = getWikiKitCandidates(
      [traveler],
      { name: "Traveler", talentGroupIdMap, weaponType: WeaponType.Sword },
      new Map(),
    );

    expect(readCandidateValues(candidateMap)).toStrictEqual({ "normalAttacks.0.hits.0.poiseDamage": [40.5] });
  });
});

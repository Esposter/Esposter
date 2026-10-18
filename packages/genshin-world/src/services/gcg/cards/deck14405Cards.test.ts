import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgCost } from "#src/models/gcg/GcgCost";
import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { BAKE_KURAGE_ID, bakeKurage } from "#src/services/gcg/cards/bakeKurage";
import { CAPRICIOUS_VISAGE_ID, capriciousVisage } from "#src/services/gcg/cards/capriciousVisage";
import { CEREMONIAL_GARMENT_ID, ceremonialGarment } from "#src/services/gcg/cards/ceremonialGarment";
import { EMBLEM_OF_SEVERED_FATE_ID, emblemOfSeveredFate } from "#src/services/gcg/cards/emblemOfSeveredFate";
import { HANACHIRUSATO_ID, hanachirusato } from "#src/services/gcg/cards/hanachirusato";
import { KID_KUJIRAI_ID, kidKujirai } from "#src/services/gcg/cards/kidKujirai";
import { RAGING_ONI_KING_ID, ragingOniKing } from "#src/services/gcg/cards/ragingOniKing";
import { SESSHOU_SAKURA_ID, sesshouSakura } from "#src/services/gcg/cards/sesshouSakura";
import {
  SUPERLATIVE_SUPERSTRENGTH_ID,
  superlativeSuperstrength,
} from "#src/services/gcg/cards/superlativeSuperstrength";
import { TENKO_THUNDERBOLTS_ID, tenkoThunderbolts } from "#src/services/gcg/cards/tenkoThunderbolts";
import { THE_SHRINES_SACRED_SHADE_ID, theShrinesSacredShade } from "#src/services/gcg/cards/theShrinesSacredShade";
import { thunderAndEternity } from "#src/services/gcg/cards/thunderAndEternity";
import { USHI_ID, ushi } from "#src/services/gcg/cards/ushi";
import { GCG_SUPPORT_LIMIT } from "#src/services/gcg/constants";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { declareGcgRoundEnd } from "#src/services/gcg/declareGcgRoundEnd";
import { passGcgTurn } from "#src/services/gcg/passGcgTurn";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgActionPhase } from "#src/services/gcg/runGcgActionPhase";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
const INAZUMA = "INAZUMA";
const LIYUE = "LIYUE";
const YAE_MIKO_ID = 1_408;
const KOKOMI_ID = 1_205;
const ITTO_ID = 1_605;
const XIAO_ID = 1_504;
const YAKAN_EVOCATION_ID = 14_082;
const TENKO_KENSHIN_ID = 14_083;
const KURAGE_OATH_ID = 12_052;
const NEREID_ASCENSION_ID = 12_053;
const MASATSU_ZETSUGI_ID = 16_052;
const ROYAL_DESCENT_ID = 16_053;
const SHRINE_TALENT_ID = 214_081;

const createCharacterState = (id: number, element: Element, nation?: string): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element,
    hp: 10,
    id,
    maxEnergy: 3,
    nameTextId: 1,
    skills: [],
    weapon: "",
    ...(nation === undefined ? {} : { nation }),
  },
  energy: 0,
  equipments: [],
  hp: 10,
  isFrozen: false,
  shield: 0,
  statuses: [],
});
const createSideState = (characters: GcgCharacterState[], dice: GcgSideState["dice"] = []): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
  dice,
  deckCardIds: [],
  drawPile: [],
  hand: [],
  hasDeclaredEnd: false,
  hasPrepared: true,
  hasRolled: true,
  isReplacementPending: false,
  onstages: [],
  summons: [],
  supports: [],
  usedCardIds: [],
  usedSkillIds: [],
});
const createDuel = (sides: [GcgSideState, GcgSideState]): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: TEST_RULE,
  sides,
  winnerSideIndex: undefined,
});
const createZoneCard = (cardId: number): GcgZoneCard => ({ cardId, counter: 0, rounds: 0, usages: 0 });
const withHp = (character: GcgCharacterState, hp: number): GcgCharacterState => ({ ...character, hp });
const withSkills = (character: GcgCharacterState, skills: GcgSkill[]): GcgCharacterState => ({
  ...character,
  character: { ...character.character, skills },
});
const createSkill = (id: number, effect: string, kind: GcgSkillKind): GcgSkill => ({
  costs: [],
  effect,
  energyGain: 0,
  id,
  kind,
});
const ELECTRO_DIE: GcgCost = { count: 2, element: Element.Electro, kind: GcgCostKind.Dice };
const TALENT_CARD: GcgCard = {
  costs: [],
  descriptionTextId: 1,
  effects: [],
  id: 211_031,
  isLocation: false,
  kind: GcgCardKind.Talent,
  nameTextId: 1,
};
const EVENT_CARD: GcgCard = { ...TALENT_CARD, id: 331_803, kind: GcgCardKind.Event };
const WEAPON_CARD: GcgCard = { ...TALENT_CARD, id: 311_401, kind: GcgCardKind.Weapon };
const ELEMENTAL_SKILL: GcgSkill = createSkill(14_082, "Effect_Damage_Electro_2", GcgSkillKind.ElementalSkill);
const NORMAL_ATTACK: GcgSkill = createSkill(14_081, "Effect_Damage_Electro_1", GcgSkillKind.NormalAttack);
const KOKOMI_NORMAL_ATTACK = createSkill(12_051, "Effect_Damage_Water_1", GcgSkillKind.NormalAttack);
const ITTO_NORMAL_ATTACK = createSkill(16_051, "Effect_Damage_Physic_2", GcgSkillKind.NormalAttack);
const YAKAN = createSkill(YAKAN_EVOCATION_ID, "Char_Skill_14082", GcgSkillKind.ElementalSkill);
const TENKO = createSkill(TENKO_KENSHIN_ID, "Char_Skill_14083", GcgSkillKind.ElementalBurst);
const KURAGE = createSkill(KURAGE_OATH_ID, "Char_Skill_12052", GcgSkillKind.ElementalSkill);
const NEREID = createSkill(NEREID_ASCENSION_ID, "Char_Skill_12053", GcgSkillKind.ElementalBurst);
const MASATSU = createSkill(MASATSU_ZETSUGI_ID, "Char_Skill_16052", GcgSkillKind.ElementalSkill);
const ROYAL = createSkill(ROYAL_DESCENT_ID, "Char_Skill_16053", GcgSkillKind.ElementalBurst);

describe("capricious Visage", () => {
  test("a talent card played spends one Elemental Die less, and once a round only", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(YAE_MIKO_ID, Element.Electro)]),
      createSideState([]),
    ]);
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    const zoneCard = createZoneCard(CAPRICIOUS_VISAGE_ID);
    const subject: GcgCostSubject = { card: TALENT_CARD, costs: [{ ...ELECTRO_DIE }], element: Element.Electro };
    expect(capriciousVisage.reduceCost?.(context, subject, zoneCard)).toStrictEqual({
      count: 1,
      kind: GcgCostKind.Dice,
    });
    capriciousVisage.onCostPaid?.(context, subject, zoneCard);
    expect(capriciousVisage.reduceCost?.(context, subject, zoneCard)).toBeUndefined();
  });

  test("an elemental skill used spends one Elemental Die less", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(YAE_MIKO_ID, Element.Electro)]),
      createSideState([]),
    ]);
    const subject: GcgCostSubject = { costs: [{ ...ELECTRO_DIE }], element: Element.Electro, skill: ELEMENTAL_SKILL };
    expect(
      capriciousVisage.reduceCost?.({ duel, sideIndex: 0 }, subject, createZoneCard(CAPRICIOUS_VISAGE_ID)),
    ).toStrictEqual({ count: 1, kind: GcgCostKind.Dice });
  });

  test.each<[string, GcgCostSubject]>([
    ["a normal attack", { costs: [{ ...ELECTRO_DIE }], element: Element.Electro, skill: NORMAL_ATTACK }],
    ["an event card", { card: EVENT_CARD, costs: [{ ...ELECTRO_DIE }], element: Element.Electro }],
    [
      "a cost with no Elemental Die",
      { card: TALENT_CARD, costs: [{ count: 1, kind: GcgCostKind.Unaligned }], element: Element.Electro },
    ],
  ])("it does not reduce %s", (_name, subject) => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(YAE_MIKO_ID, Element.Electro)]),
      createSideState([]),
    ]);
    expect(
      capriciousVisage.reduceCost?.({ duel, sideIndex: 0 }, subject, createZoneCard(CAPRICIOUS_VISAGE_ID)),
    ).toBeUndefined();
  });
});

describe("thunder and Eternity", () => {
  test("it converts every Elemental Die of its side to an Omni die", () => {
    expect.hasAssertions();
    const side = createSideState(
      [createCharacterState(YAE_MIKO_ID, Element.Electro, INAZUMA)],
      [Element.Electro, GcgDieFace.Omni, Element.Pyro],
    );
    const duel = createDuel([side, createSideState([])]);
    thunderAndEternity.play?.({ duel, sideIndex: 0 }, undefined);
    expect(side.dice).toStrictEqual([GcgDieFace.Omni, GcgDieFace.Omni, GcgDieFace.Omni]);
  });

  test("it is played only with two Inazuman characters on its side", () => {
    expect.hasAssertions();
    const inazuma = createDuel([
      createSideState([
        createCharacterState(YAE_MIKO_ID, Element.Electro, INAZUMA),
        createCharacterState(KOKOMI_ID, Element.Hydro, INAZUMA),
      ]),
      createSideState([]),
    ]);
    expect(thunderAndEternity.canPlay?.({ duel: inazuma, sideIndex: 0 }, undefined)).toBe(true);
    const mixed = createDuel([
      createSideState([
        createCharacterState(YAE_MIKO_ID, Element.Electro, INAZUMA),
        createCharacterState(XIAO_ID, Element.Anemo, LIYUE),
      ]),
      createSideState([]),
    ]);
    expect(thunderAndEternity.canPlay?.({ duel: mixed, sideIndex: 0 }, undefined)).toBe(false);
  });
});

describe("bake-Kurage", () => {
  test("it deals 1 Hydro DMG and heals its active character 1 HP at the End Phase, spending a usage", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([withHp(createCharacterState(KOKOMI_ID, Element.Hydro), 9)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).summons.push({ ...createGcgZoneCard(BAKE_KURAGE_ID, bakeKurage), usages: 2 });
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([9]);
    expect(takeOne(duel.sides, 0).characters.map(({ hp }) => hp)).toStrictEqual([10]);
    expect(takeOne(duel.sides, 0).summons.map(({ usages }) => usages)).toStrictEqual([1]);
  });

  test("Kurage's Oath stacks a second Bake-Kurage's usages, up to four", () => {
    expect.hasAssertions();
    const duel = createDuel([createSideState([createCharacterState(KOKOMI_ID, Element.Hydro)]), createSideState([])]);
    runGcgSkillUse({ duel, sideIndex: 0 }, KURAGE);
    runGcgSkillUse({ duel, sideIndex: 0 }, KURAGE);
    runGcgSkillUse({ duel, sideIndex: 0 }, KURAGE);
    expect(takeOne(duel.sides, 0).summons.map(({ cardId, usages }) => ({ cardId, usages }))).toStrictEqual([
      { cardId: BAKE_KURAGE_ID, usages: 4 },
    ]);
  });
});

describe("ceremonial Garment", () => {
  test("its character's Normal Attacks deal 1 more DMG, and heal every character 1 HP after the attack", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        {
          ...createCharacterState(KOKOMI_ID, Element.Hydro),
          statuses: [createGcgZoneCard(CEREMONIAL_GARMENT_ID, ceremonialGarment)],
        },
        withHp(createCharacterState(YAE_MIKO_ID, Element.Electro), 5),
      ]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, KOKOMI_NORMAL_ATTACK);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([8]);
    expect(takeOne(duel.sides, 0).characters.map(({ hp }) => hp)).toStrictEqual([10, 6]);
  });
});

describe("sesshou Sakura", () => {
  test("it deals 1 Electro DMG at the End Phase and spends a usage", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(YAE_MIKO_ID, Element.Electro)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).summons.push({ ...createGcgZoneCard(SESSHOU_SAKURA_ID, sesshouSakura), usages: 3 });
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([9]);
    expect(takeOne(duel.sides, 0).summons.map(({ usages }) => usages)).toStrictEqual([2]);
  });

  test("with at least four usages, declaring the round's end deals 1 Electro DMG and spends one usage", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(YAE_MIKO_ID, Element.Electro)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).summons.push({ ...createGcgZoneCard(SESSHOU_SAKURA_ID, sesshouSakura), usages: 4 });
    declareGcgRoundEnd(duel, 0, TEST_RULE);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([9]);
    expect(takeOne(duel.sides, 0).summons.map(({ usages }) => usages)).toStrictEqual([3]);
  });

  test("with fewer than four usages, declaring the round's end deals no damage", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(YAE_MIKO_ID, Element.Electro)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).summons.push({ ...createGcgZoneCard(SESSHOU_SAKURA_ID, sesshouSakura), usages: 3 });
    declareGcgRoundEnd(duel, 0, TEST_RULE);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([10]);
  });
});

describe("yakan Evocation: Sesshou Sakura", () => {
  test("it summons a Sesshou Sakura", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(YAE_MIKO_ID, Element.Electro)]),
      createSideState([]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, YAKAN);
    expect(takeOne(duel.sides, 0).summons.map(({ cardId }) => cardId)).toStrictEqual([SESSHOU_SAKURA_ID]);
  });

  test("a second one stacks its usages, and its damage is raised by 1", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(YAE_MIKO_ID, Element.Electro)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, YAKAN);
    runGcgSkillUse({ duel, sideIndex: 0 }, YAKAN);
    expect(takeOne(duel.sides, 0).summons.map(({ usages }) => usages)).toStrictEqual([6]);
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([8]);
  });
});

describe("great Secret Art: Tenko Kenshin", () => {
  test("it deals 4 Electro DMG and, with a Sesshou Sakura on its side, destroys it and creates Tenko Thunderbolts", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([withSkills(createCharacterState(YAE_MIKO_ID, Element.Electro), [TENKO])]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).summons.push({ ...createGcgZoneCard(SESSHOU_SAKURA_ID, sesshouSakura), usages: 3 });
    runGcgSkillUse({ duel, sideIndex: 0 }, TENKO);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([6]);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([]);
    expect(takeOne(duel.sides, 0).onstages.map(({ cardId }) => cardId)).toStrictEqual([TENKO_THUNDERBOLTS_ID]);
  });

  test("without a Sesshou Sakura it deals its damage alone", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(YAE_MIKO_ID, Element.Electro)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, TENKO);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([6]);
    expect(takeOne(duel.sides, 0).onstages).toStrictEqual([]);
  });
});

describe("tenko Thunderbolts", () => {
  test("before its side chooses its action it deals 3 Electro DMG, once", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(YAE_MIKO_ID, Element.Electro)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    duel.actingSideIndex = 1;
    takeOne(duel.sides, 0).onstages.push({ ...createGcgZoneCard(TENKO_THUNDERBOLTS_ID, tenkoThunderbolts), usages: 1 });
    passGcgTurn(duel, 1);
    expect(duel.actingSideIndex).toBe(0);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([7]);
    expect(takeOne(duel.sides, 0).onstages).toStrictEqual([]);
    passGcgTurn(duel, 0);
    passGcgTurn(duel, 1);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([7]);
  });
});

describe("ushi", () => {
  test("the active character takes 1 less DMG, once", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(ITTO_ID, Element.Geo)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).summons.push(createGcgZoneCard(USHI_ID, ushi));
    applyGcgDamage(duel, 1, { damageType: Element.Hydro, value: 3 }, TEST_RULE);
    expect(takeOne(duel.sides, 0).characters.map(({ hp }) => hp)).toStrictEqual([8]);
    applyGcgDamage(duel, 1, { damageType: Element.Hydro, value: 3 }, TEST_RULE);
    expect(takeOne(duel.sides, 0).characters.map(({ hp }) => hp)).toStrictEqual([5]);
  });

  test("the first DMG the active character takes attaches Superlative Superstrength to Arataki Itto, once", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(ITTO_ID, Element.Geo)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).summons.push(createGcgZoneCard(USHI_ID, ushi));
    applyGcgDamage(duel, 1, { damageType: Element.Hydro, value: 3 }, TEST_RULE);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).statuses).toStrictEqual([
      expect.objectContaining({ cardId: SUPERLATIVE_SUPERSTRENGTH_ID, usages: 1 }),
    ]);
    takeOne(takeOne(takeOne(duel.sides, 0).characters, 0).statuses, 0).usages = 3;
    applyGcgDamage(duel, 1, { damageType: Element.Hydro, value: 3 }, TEST_RULE);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).statuses.map(({ usages }) => usages)).toStrictEqual([3]);
  });

  test("placed again by Masatsu Zetsugi, it reduces the next DMG once more, and its Superlative attach stays spent", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([withSkills(createCharacterState(ITTO_ID, Element.Geo), [MASATSU])]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).summons.push(createGcgZoneCard(USHI_ID, ushi));
    applyGcgDamage(duel, 1, { damageType: Element.Hydro, value: 3 }, TEST_RULE);
    runGcgSkillUse({ duel, sideIndex: 0 }, MASATSU);
    applyGcgDamage(duel, 1, { damageType: Element.Hydro, value: 3 }, TEST_RULE);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).hp).toBe(6);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).statuses.map(({ usages }) => usages)).toStrictEqual([2]);
  });

  test("at the End Phase it is discarded, deals 1 Geo DMG and attaches Superlative Superstrength to Arataki Itto", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(ITTO_ID, Element.Geo)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).summons.push(createGcgZoneCard(USHI_ID, ushi));
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([9]);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([]);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).statuses.map(({ cardId }) => cardId)).toStrictEqual([
      SUPERLATIVE_SUPERSTRENGTH_ID,
    ]);
  });
});

describe("raging Oni King", () => {
  test("its character's Normal Attacks deal 1 more DMG, and its Physical DMG becomes Geo DMG", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        {
          ...createCharacterState(ITTO_ID, Element.Geo),
          statuses: [createGcgZoneCard(RAGING_ONI_KING_ID, ragingOniKing)],
        },
      ]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, ITTO_NORMAL_ATTACK);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([7]);
  });

  test("after a Normal Attack its character gains Superlative Superstrength, once a round", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        {
          ...createCharacterState(ITTO_ID, Element.Geo),
          statuses: [createGcgZoneCard(RAGING_ONI_KING_ID, ragingOniKing)],
        },
      ]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, ITTO_NORMAL_ATTACK);
    runGcgSkillUse({ duel, sideIndex: 0 }, ITTO_NORMAL_ATTACK);
    expect(
      takeOne(takeOne(duel.sides, 0).characters, 0).statuses.filter(
        ({ cardId }) => cardId === SUPERLATIVE_SUPERSTRENGTH_ID,
      ),
    ).toStrictEqual([expect.objectContaining({ usages: 1 })]);
  });
});

describe("superlative Superstrength", () => {
  test("a Charged Attack deals 1 more DMG and spends a usage", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        {
          ...createCharacterState(ITTO_ID, Element.Geo),
          statuses: [{ ...createGcgZoneCard(SUPERLATIVE_SUPERSTRENGTH_ID, superlativeSuperstrength), usages: 2 }],
        },
      ]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).hasChargedAttack = true;
    runGcgSkillUse({ duel, sideIndex: 0 }, ITTO_NORMAL_ATTACK);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([7]);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).statuses.map(({ usages }) => usages)).toStrictEqual([1]);
  });

  test("a Normal Attack that is no Charged Attack deals no extra DMG", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        {
          ...createCharacterState(ITTO_ID, Element.Geo),
          statuses: [{ ...createGcgZoneCard(SUPERLATIVE_SUPERSTRENGTH_ID, superlativeSuperstrength), usages: 2 }],
        },
      ]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, ITTO_NORMAL_ATTACK);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([8]);
  });

  test.each([
    [2, true],
    [3, false],
  ])("the Action Phase makes a side with %i Elemental Dice a Charged Attack side: %s", (diceCount, isCharged) => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState(
        [createCharacterState(ITTO_ID, Element.Geo)],
        Array.from({ length: diceCount }, () => Element.Geo),
      ),
      createSideState([]),
    ]);
    runGcgActionPhase(duel);
    expect(takeOne(duel.sides, 0).hasChargedAttack).toBe(isCharged);
  });

  test("with at least two usages, a Charged Attack spends one Unaligned die less", () => {
    expect.hasAssertions();
    const duel = createDuel([createSideState([createCharacterState(ITTO_ID, Element.Geo)]), createSideState([])]);
    duel.sides[0].hasChargedAttack = true;
    const subject: GcgCostSubject = {
      costs: [{ count: 2, kind: GcgCostKind.Unaligned }],
      element: Element.Geo,
      skill: ITTO_NORMAL_ATTACK,
    };
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    expect(
      superlativeSuperstrength.reduceCost?.(context, subject, {
        ...createGcgZoneCard(SUPERLATIVE_SUPERSTRENGTH_ID, superlativeSuperstrength),
        usages: 2,
      }),
    ).toStrictEqual({ count: 1, kind: GcgCostKind.Unaligned });
    expect(
      superlativeSuperstrength.reduceCost?.(context, subject, {
        ...createGcgZoneCard(SUPERLATIVE_SUPERSTRENGTH_ID, superlativeSuperstrength),
        usages: 1,
      }),
    ).toBeUndefined();
  });
});

describe("emblem of Severed Fate", () => {
  test("after another character of its side uses an Elemental Burst, its character gains 1 Energy", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        withSkills(createCharacterState(YAE_MIKO_ID, Element.Electro), [TENKO]),
        {
          ...createCharacterState(ITTO_ID, Element.Geo),
          equipments: [createGcgZoneCard(EMBLEM_OF_SEVERED_FATE_ID, emblemOfSeveredFate)],
        },
      ]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, TENKO);
    expect(takeOne(takeOne(duel.sides, 0).characters, 1).energy).toBe(1);
  });

  test("a burst by a character of the other side gives no Energy to its character", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([withSkills(createCharacterState(YAE_MIKO_ID, Element.Electro), [TENKO])]),
      createSideState([
        {
          ...createCharacterState(KOKOMI_ID, Element.Hydro),
          equipments: [createGcgZoneCard(EMBLEM_OF_SEVERED_FATE_ID, emblemOfSeveredFate)],
        },
        withSkills(createCharacterState(YAE_MIKO_ID, Element.Electro), [TENKO]),
      ]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, TENKO);
    expect(takeOne(takeOne(duel.sides, 1).characters, 0).energy).toBe(0);
  });

  test("its character's Elemental Bursts deal 2 more DMG, once a round", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        {
          ...createCharacterState(ITTO_ID, Element.Geo),
          equipments: [createGcgZoneCard(EMBLEM_OF_SEVERED_FATE_ID, emblemOfSeveredFate)],
        },
      ]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, ROYAL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([4]);
  });
});

describe("hanachirusato", () => {
  test("it gains a Cleansing Ritual Progress when a Summon disappears", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(KOKOMI_ID, Element.Hydro)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).supports.push(createGcgZoneCard(HANACHIRUSATO_ID, hanachirusato));
    takeOne(duel.sides, 0).summons.push({ ...createGcgZoneCard(BAKE_KURAGE_ID, bakeKurage), usages: 1 });
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 0).supports.map(({ counter }) => counter)).toStrictEqual([1]);
  });

  test("its Progress stops at three", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(KOKOMI_ID, Element.Hydro)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).supports.push({ ...createGcgZoneCard(HANACHIRUSATO_ID, hanachirusato), counter: 3 });
    takeOne(duel.sides, 0).summons.push({ ...createGcgZoneCard(BAKE_KURAGE_ID, bakeKurage), usages: 1 });
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 0).supports.map(({ counter }) => counter)).toStrictEqual([3]);
  });

  test("with three Progress, playing a Weapon costs two Elemental Dice less and discards it", () => {
    expect.hasAssertions();
    const duel = createDuel([createSideState([createCharacterState(KOKOMI_ID, Element.Hydro)]), createSideState([])]);
    const zoneCard = { ...createGcgZoneCard(HANACHIRUSATO_ID, hanachirusato), counter: 3, usages: 1 };
    takeOne(duel.sides, 0).supports.push(zoneCard);
    const subject: GcgCostSubject = { card: WEAPON_CARD, costs: [{ ...ELECTRO_DIE }], element: Element.Hydro };
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    expect(hanachirusato.reduceCost?.(context, subject, zoneCard)).toStrictEqual({ count: 2, kind: GcgCostKind.Dice });
    hanachirusato.onCostPaid?.(context, subject, zoneCard);
    expect(zoneCard.usages).toBe(0);
  });
});

describe("kid Kujirai", () => {
  test("at the Action Phase it creates an Omni die and moves to the opposing Support Zone when it has room", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(KOKOMI_ID, Element.Hydro)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).supports.push(createGcgZoneCard(KID_KUJIRAI_ID, kidKujirai));
    runGcgActionPhase(duel);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([GcgDieFace.Omni]);
    expect(takeOne(duel.sides, 0).supports).toStrictEqual([]);
    expect(takeOne(duel.sides, 1).supports.map(({ cardId }) => cardId)).toStrictEqual([KID_KUJIRAI_ID]);
  });

  test("it stays on its side when the opposing Support Zone is full", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(KOKOMI_ID, Element.Hydro)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).supports.push(createGcgZoneCard(KID_KUJIRAI_ID, kidKujirai));
    takeOne(duel.sides, 1).supports = Array.from({ length: GCG_SUPPORT_LIMIT }, () =>
      createGcgZoneCard(HANACHIRUSATO_ID, hanachirusato),
    );
    runGcgActionPhase(duel);
    expect(takeOne(duel.sides, 0).supports.map(({ cardId }) => cardId)).toStrictEqual([KID_KUJIRAI_ID]);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([GcgDieFace.Omni]);
  });
});

describe("the Shrine's Sacred Shade", () => {
  test("it is played on Yae Miko and uses Great Secret Art: Tenko Kenshin at once", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([withSkills(createCharacterState(YAE_MIKO_ID, Element.Electro), [TENKO])]),
      createSideState([]),
    ]);
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    expect(theShrinesSacredShade.canPlay?.(context, 0)).toBe(true);
    expect(theShrinesSacredShade.skillOnPlay?.(context, 0)?.id).toBe(TENKO_KENSHIN_ID);
  });

  test("after Yae Miko destroys a Sesshou Sakura through Tenko Kenshin, the next Yakan Evocation this round costs 2 fewer", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        {
          ...withSkills(createCharacterState(YAE_MIKO_ID, Element.Electro), [TENKO, YAKAN]),
          equipments: [createGcgZoneCard(SHRINE_TALENT_ID, theShrinesSacredShade)],
        },
      ]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    takeOne(duel.sides, 0).summons.push({ ...createGcgZoneCard(SESSHOU_SAKURA_ID, sesshouSakura), usages: 3 });
    runGcgSkillUse({ duel, sideIndex: 0 }, TENKO);
    const shrine = takeOne(takeOne(takeOne(duel.sides, 0).characters, 0).equipments, 0);
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    const subject: GcgCostSubject = { costs: [{ ...ELECTRO_DIE }], element: Element.Electro, skill: YAKAN };
    expect(theShrinesSacredShade.reduceCost?.(context, subject, shrine)).toStrictEqual({
      count: 2,
      kind: GcgCostKind.Dice,
    });
    theShrinesSacredShade.onCostPaid?.(context, subject, shrine);
    expect(theShrinesSacredShade.reduceCost?.(context, subject, shrine)).toBeUndefined();
  });
});

describe("masatsu Zetsugi: Akaushi Burst!", () => {
  test("it deals 1 Geo DMG, summons Ushi and gains Superlative Superstrength", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([withSkills(createCharacterState(ITTO_ID, Element.Geo), [])]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, MASATSU);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([9]);
    expect(takeOne(duel.sides, 0).summons.map(({ cardId }) => cardId)).toStrictEqual([USHI_ID]);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).statuses.map(({ cardId }) => cardId)).toStrictEqual([
      SUPERLATIVE_SUPERSTRENGTH_ID,
    ]);
  });
});

describe("royal Descent: Behold, Itto the Evil!", () => {
  test("it deals 4 Geo DMG and gains Raging Oni King", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(ITTO_ID, Element.Geo)]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, ROYAL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([6]);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).statuses.map(({ cardId }) => cardId)).toStrictEqual([
      RAGING_ONI_KING_ID,
    ]);
  });
});

describe("nereid's Ascension", () => {
  test("it deals 2 Hydro DMG, heals all its characters 1 HP and gains Ceremonial Garment", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        createCharacterState(KOKOMI_ID, Element.Hydro),
        withHp(createCharacterState(YAE_MIKO_ID, Element.Electro), 5),
      ]),
      createSideState([createCharacterState(XIAO_ID, Element.Anemo)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, NEREID);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([8]);
    expect(takeOne(duel.sides, 0).characters.map(({ hp }) => hp)).toStrictEqual([10, 6]);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).statuses.map(({ cardId }) => cardId)).toStrictEqual([
      CEREMONIAL_GARMENT_ID,
    ]);
  });
});

describe("kurage's Oath", () => {
  test("it applies Hydro to its character and summons Bake-Kurage", () => {
    expect.hasAssertions();
    const duel = createDuel([createSideState([createCharacterState(KOKOMI_ID, Element.Hydro)]), createSideState([])]);
    runGcgSkillUse({ duel, sideIndex: 0 }, KURAGE);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).aura).toBe(Element.Hydro);
    expect(takeOne(duel.sides, 0).summons.map(({ cardId }) => cardId)).toStrictEqual([BAKE_KURAGE_ID]);
  });
});

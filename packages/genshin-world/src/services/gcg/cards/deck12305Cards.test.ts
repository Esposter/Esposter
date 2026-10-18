import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { baneOfAllEvil } from "#src/services/gcg/cards/baneOfAllEvil";
import { conquerorOfEvilGuardianYaksha } from "#src/services/gcg/cards/conquerorOfEvilGuardianYaksha";
import { liuSu } from "#src/services/gcg/cards/liuSu";
import { lithicSpear } from "#src/services/gcg/cards/lithicSpear";
import { dunyarzad } from "#src/services/gcg/cards/dunyarzad";
import { divineMaidensDeliverance } from "#src/services/gcg/cards/divineMaidensDeliverance";
import { ICY_QUILL_ID, icyQuill } from "#src/services/gcg/cards/icyQuill";
import { rana } from "#src/services/gcg/cards/rana";
import { shatteringIce } from "#src/services/gcg/cards/shatteringIce";
import { MYSTICAL_ABANDON_ID, mysticalAbandon } from "#src/services/gcg/cards/mysticalAbandon";
import { stoneAndContracts } from "#src/services/gcg/cards/stoneAndContracts";
import { springSpiritSummoning } from "#src/services/gcg/cards/springSpiritSummoning";
import { vermillionHereafter } from "#src/services/gcg/cards/vermillionHereafter";
import { TALISMAN_SPIRIT_ID, talismanSpirit } from "#src/services/gcg/cards/talismanSpirit";
import { YAKSHAS_MASK_ID, yakshasMask } from "#src/services/gcg/cards/yakshasMask";
import { GCG_SHIELD_LIMIT, GCG_SPREAD_DAMAGE } from "#src/services/gcg/constants";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { runGcgActionPhase } from "#src/services/gcg/runGcgActionPhase";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { switchGcgActiveCharacter } from "#src/services/gcg/switchGcgActiveCharacter";
import { switchGcgCharacter } from "#src/services/gcg/switchGcgCharacter";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

const SHENHE_ID = 1_107;

const createCharacterState = (id: number): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Cryo,
    hp: 10,
    id,
    maxEnergy: 3,
    nameTextId: 1,
    skills: [],
    weapon: "",
  },
  energy: 0,
  equipments: [],
  hp: 10,
  isFrozen: false,
  shield: 0,
  statuses: [],
});

const createSideState = (characters: GcgCharacterState[]): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
  dice: [],
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

const KABUKI: GcgSkill = {
  costs: [],
  effect: "Effect_Damage_Physic_2",
  energyGain: 1,
  id: 11_051,
  kind: GcgSkillKind.NormalAttack,
};
const HYOUKA: GcgSkill = {
  costs: [],
  effect: "Effect_Damage_Ice_3",
  energyGain: 1,
  id: 11_052,
  kind: GcgSkillKind.ElementalSkill,
};
const SPRING_SPIRIT_SUMMONING: GcgSkill = {
  costs: [],
  effect: "Char_Skill_11072",
  energyGain: 1,
  id: 11_072,
  kind: GcgSkillKind.ElementalSkill,
};

const XIAO_ID = 1_504;
const CONQUEROR_OF_EVIL_ID = 215_041;
const BANE_OF_ALL_EVIL: GcgSkill = {
  costs: [],
  effect: "Char_Skill_15043",
  energyGain: 2,
  id: 15_043,
  kind: GcgSkillKind.ElementalBurst,
};
const LEMNISCATIC_WIND_CYCLING: GcgSkill = {
  costs: [],
  effect: "Effect_Damage_Wind_3",
  energyGain: 1,
  id: 15_042,
  kind: GcgSkillKind.ElementalSkill,
};

const LIU_SU_ID = 322_012;
const DUNYARZAD_ID = 322_016;
const RANA_ID = 322_017;
const PLAIN_SUPPORT_ID = 321_001;
const LITHIC_SPEAR_ID = 311_402;
const VERMILLION_HEREAFTER_ID = 312_012;
const STONE_AND_CONTRACTS_ID = 331_802;
const DRAWN_CARD_ID = 213_011;
const TALENT_CARD: GcgCard = {
  costs: [],
  descriptionTextId: 1,
  effects: [],
  id: 211_031,
  isLocation: false,
  kind: GcgCardKind.Talent,
  nameTextId: 1,
};
const EVENT_CARD: GcgCard = { ...TALENT_CARD, id: 331_802, kind: GcgCardKind.Event };

// A companion Support Card, with no cost of its own
const createCompanion = (id: number): GcgCard => ({ ...TALENT_CARD, id, isCompanion: true, kind: GcgCardKind.Support });

// A character of the element named
const createElementCharacter = (id: number, element: Element): GcgCharacterState => {
  const state = createCharacterState(id);
  return { ...state, character: { ...state.character, element } };
};

// A Liyue character who wields the weapon kind named
const createLiyueCharacter = (id: number, weapon: string): GcgCharacterState => {
  const state = createCharacterState(id);
  return { ...state, character: { ...state.character, nation: "LIYUE", weapon } };
};

describe("spring Spirit Summoning", () => {
  test("it deals 2 Cryo DMG, then creates an Icy Quill on its side", () => {
    expect.hasAssertions();

    const duel = createDuel([createSideState([createCharacterState(SHENHE_ID)]), createSideState([])]);
    const context = { duel, sideIndex: 0 };

    expect(springSpiritSummoning.getDamage?.(context)).toStrictEqual({ damageType: Element.Cryo, value: 2 });
    springSpiritSummoning.afterDamage?.(context);
    expect(takeOne(duel.sides, 0).onstages).toStrictEqual([createGcgZoneCard(ICY_QUILL_ID, icyQuill)]);
  });

  test("a second Icy Quill on its side adds its own, and the one already there keeps its usages", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(SHENHE_ID)]);
    side.onstages.push({ ...createGcgZoneCard(ICY_QUILL_ID, icyQuill), usages: 1 });
    const duel = createDuel([side, createSideState([])]);

    springSpiritSummoning.afterDamage?.({ duel, sideIndex: 0 });
    expect(side.onstages).toStrictEqual([
      { ...createGcgZoneCard(ICY_QUILL_ID, icyQuill), usages: 1 },
      createGcgZoneCard(ICY_QUILL_ID, icyQuill),
    ]);
  });
});

describe("icy Quill", () => {
  test("it deals 1 more Cryo DMG to a Cryo hit, spending a usage", () => {
    expect.hasAssertions();

    const duel = createDuel([createSideState([createCharacterState(SHENHE_ID)]), createSideState([])]);
    const zoneCard = createGcgZoneCard(ICY_QUILL_ID, icyQuill);

    expect(
      icyQuill.modifyDamageDealt?.(
        { duel, sideIndex: 0, skill: HYOUKA },
        { damageType: Element.Cryo, value: 2 },
        zoneCard,
      ),
    ).toStrictEqual({ damageType: Element.Cryo, value: 3 });
    expect(zoneCard.usages).toBe(1);
  });

  test.each([
    [GcgDamageKind.Physical, 2],
    [Element.Cryo, 0],
  ])("it adds nothing to a hit of %s with %i usages left", (damageType, usages) => {
    expect.hasAssertions();

    const duel = createDuel([createSideState([createCharacterState(SHENHE_ID)]), createSideState([])]);
    const zoneCard = { ...createGcgZoneCard(ICY_QUILL_ID, icyQuill), usages };

    expect(
      icyQuill.modifyDamageDealt?.({ duel, sideIndex: 0, skill: HYOUKA }, { damageType, value: 2 }, zoneCard),
    ).toStrictEqual({ damageType, value: 2 });
    expect(zoneCard.usages).toBe(usages);
  });

  test("without Mystical Abandon, a Normal Attack spends a usage like any other hit", () => {
    expect.hasAssertions();

    const duel = createDuel([createSideState([createCharacterState(SHENHE_ID)]), createSideState([])]);
    const zoneCard = createGcgZoneCard(ICY_QUILL_ID, icyQuill);
    const context = { duel, sideIndex: 0, skill: KABUKI };

    icyQuill.modifyDamageDealt?.(context, { damageType: Element.Cryo, value: 2 }, zoneCard);
    expect(zoneCard.usages).toBe(1);
  });

  test("with Mystical Abandon equipped to a character of its side, the first Normal Attack each Round spends no usage", () => {
    expect.hasAssertions();

    const shenhe = createCharacterState(SHENHE_ID);
    shenhe.equipments = [createGcgZoneCard(MYSTICAL_ABANDON_ID, mysticalAbandon)];
    const duel = createDuel([createSideState([shenhe]), createSideState([])]);
    const zoneCard = createGcgZoneCard(ICY_QUILL_ID, icyQuill);
    const context = { duel, sideIndex: 0, skill: KABUKI };
    const damage = { damageType: Element.Cryo, value: 2 };

    expect(icyQuill.modifyDamageDealt?.(context, damage, zoneCard)).toStrictEqual({
      damageType: Element.Cryo,
      value: 3,
    });
    expect(zoneCard.usages).toBe(2);
    expect(icyQuill.modifyDamageDealt?.(context, damage, zoneCard)).toStrictEqual({
      damageType: Element.Cryo,
      value: 3,
    });
    expect(zoneCard.usages).toBe(1);
  });
  test("a Swirl's spread is Cryo DMG too, so it takes Icy Quill's 1 more and spends a usage", () => {
    expect.hasAssertions();

    const duel = createDuel([
      { ...createSideState([createCharacterState(SHENHE_ID)]), onstages: [createGcgZoneCard(ICY_QUILL_ID, icyQuill)] },
      createSideState([{ ...createCharacterState(1_202), aura: Element.Cryo }, createCharacterState(1_203)]),
    ]);

    applyGcgDamage(duel, 0, { damageType: Element.Anemo, value: 1 }, TEST_RULE, { duel, sideIndex: 0 });
    expect(takeOne(takeOne(duel.sides, 1).characters, 1).hp).toBe(10 - GCG_SPREAD_DAMAGE - 1);
    expect(takeOne(duel.sides, 0).onstages.map(({ usages }) => usages)).toStrictEqual([1]);
  });
});

describe("divine Maiden's Deliverance", () => {
  test("it deals 1 Cryo DMG, then summons a Talisman Spirit on its side", () => {
    expect.hasAssertions();

    const duel = createDuel([createSideState([createCharacterState(SHENHE_ID)]), createSideState([])]);
    const context = { duel, sideIndex: 0 };

    expect(divineMaidensDeliverance.getDamage?.(context)).toStrictEqual({ damageType: Element.Cryo, value: 1 });
    divineMaidensDeliverance.afterDamage?.(context);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit)]);
  });

  test("a Talisman Spirit already on its side is refreshed rather than doubled", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(SHENHE_ID)]);
    side.summons.push({ ...createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit), usages: 0 });
    const duel = createDuel([side, createSideState([])]);

    divineMaidensDeliverance.afterDamage?.({ duel, sideIndex: 0 });
    expect(side.summons).toStrictEqual([createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit)]);
  });
});

describe("talisman Spirit", () => {
  test("it deals 1 Cryo DMG at each End Phase, for two usages", () => {
    expect.hasAssertions();

    const context = { duel: createDuel([createSideState([]), createSideState([])]), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit);

    expect(talismanSpirit.onEndPhase?.(context, zoneCard)).toStrictEqual({ damageType: Element.Cryo, value: 1 });
    expect(zoneCard.usages).toBe(1);
    expect(talismanSpirit.onEndPhase?.(context, zoneCard)).toStrictEqual({ damageType: Element.Cryo, value: 1 });
    expect(zoneCard.usages).toBe(0);
  });

  test("its End Phase DMG is raised by its own 1 more Cryo DMG", () => {
    expect.hasAssertions();

    const duel = createDuel([
      { ...createSideState([]), summons: [createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit)] },
      createSideState([createCharacterState(1_202)]),
    ]);

    runGcgEndPhase(duel);
    expect(takeOne(takeOne(duel.sides, 1).characters, 0).hp).toBe(8);
  });

  test.each([
    [Element.Cryo, 3],
    [GcgDamageKind.Physical, 3],
    [Element.Pyro, 2],
  ])("it adds 1 to a %s hit its side deals, and to no other element's", (damageType, value) => {
    expect.hasAssertions();

    const duel = createDuel([createSideState([]), createSideState([])]);
    const zoneCard = createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit);

    expect(
      talismanSpirit.modifyDamageDealt?.({ duel, sideIndex: 0 }, { damageType, value: 2 }, zoneCard),
    ).toStrictEqual({ damageType, value });
  });
});

describe("mystical Abandon", () => {
  test("it equips to Shenhe while she is active, and has her use Spring Spirit Summoning at once", () => {
    expect.hasAssertions();

    const shenhe = createCharacterState(SHENHE_ID);
    shenhe.character.skills = [SPRING_SPIRIT_SUMMONING];
    const context = { duel: createDuel([createSideState([shenhe]), createSideState([])]), sideIndex: 0 };

    expect(mysticalAbandon.canPlay?.(context, 0)).toBe(true);
    expect(mysticalAbandon.skillOnPlay?.(context, 0)).toStrictEqual(SPRING_SPIRIT_SUMMONING);
  });
});

describe("bane of All Evil", () => {
  test("it deals 4 Anemo DMG, then Xiao gains Yaksha's Mask for two Rounds", () => {
    expect.hasAssertions();

    const xiao = createCharacterState(XIAO_ID);
    const duel = createDuel([createSideState([xiao]), createSideState([])]);
    const context = { duel, sideIndex: 0 };

    expect(baneOfAllEvil.getDamage?.(context)).toStrictEqual({ damageType: Element.Anemo, value: 4 });
    baneOfAllEvil.afterDamage?.(context);
    expect(xiao.statuses).toStrictEqual([createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask)]);
    expect(takeOne(xiao.statuses, 0)).toMatchObject({ rounds: 2, usages: 2 });
  });

  test("a Yaksha's Mask already on Xiao is refreshed rather than doubled", () => {
    expect.hasAssertions();

    const xiao = {
      ...createCharacterState(XIAO_ID),
      statuses: [{ ...createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask), rounds: 1, usages: 0 }],
    };
    const duel = createDuel([createSideState([xiao]), createSideState([])]);

    baneOfAllEvil.afterDamage?.({ duel, sideIndex: 0 });
    expect(xiao.statuses).toStrictEqual([createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask)]);
  });
});

describe("yaksha's Mask", () => {
  test.each([
    [GcgDamageKind.Physical, Element.Anemo, 3],
    [Element.Anemo, Element.Anemo, 3],
    [Element.Pyro, Element.Pyro, 2],
  ])("it deals a %s hit as %s, and an Anemo hit 1 more", (damageType, dealtAs, value) => {
    expect.hasAssertions();

    const duel = createDuel([createSideState([createCharacterState(XIAO_ID)]), createSideState([])]);
    const zoneCard = createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask);

    expect(yakshasMask.modifyDamageDealt?.({ duel, sideIndex: 0 }, { damageType, value: 2 }, zoneCard)).toStrictEqual({
      damageType: dealtAs,
      value,
    });
  });

  test("a Plunging Attack deals 2 more DMG", () => {
    expect.hasAssertions();

    const duel = createDuel([createSideState([createCharacterState(XIAO_ID)]), createSideState([])]);
    const zoneCard = createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask);

    expect(
      yakshasMask.modifyDamageDealt?.(
        { duel, isPlunge: true, sideIndex: 0 },
        { damageType: GcgDamageKind.Physical, value: 2 },
        zoneCard,
      ),
    ).toStrictEqual({ damageType: Element.Anemo, value: 5 });
  });
});

describe("yaksha's Mask's switch clause", () => {
  // Xiao is active, with the mask, and three Cryo dice to pay a switch with
  const createSwitchDuel = (): GcgDuel => {
    const duel = createDuel([
      createSideState([
        { ...createCharacterState(XIAO_ID), statuses: [createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask)] },
        createCharacterState(1_104),
      ]),
      createSideState([createCharacterState(1_107)]),
    ]);
    takeOne(duel.sides, 0).dice = [Element.Cryo, Element.Cryo, Element.Cryo];
    return duel;
  };

  test("while Xiao is active, a switch away from her spends one die less", () => {
    expect.hasAssertions();

    const duel = createSwitchDuel();

    expect(switchGcgCharacter(duel, 0, 1, [])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0)).toMatchObject({ activeIndex: 1, dice: [Element.Cryo, Element.Cryo, Element.Cryo] });
  });

  test("a switch to Xiao while another character is active gets no reduction", () => {
    expect.hasAssertions();

    const duel = createSwitchDuel();
    takeOne(duel.sides, 0).activeIndex = 1;

    expect(switchGcgCharacter(duel, 0, 0, [])).toBe(GcgActionResult.Unpayable);
    expect(switchGcgCharacter(duel, 0, 0, [0])).toBe(GcgActionResult.Done);
  });

  test("the reduction is taken once per Round", () => {
    expect.hasAssertions();

    const duel = createSwitchDuel();

    expect(switchGcgCharacter(duel, 0, 1, [])).toBe(GcgActionResult.Done);
    duel.actingSideIndex = 0;
    expect(switchGcgCharacter(duel, 0, 0, [0])).toBe(GcgActionResult.Done);
    duel.actingSideIndex = 0;
    expect(switchGcgCharacter(duel, 0, 1, [])).toBe(GcgActionResult.Unpayable);
    expect(switchGcgCharacter(duel, 0, 1, [0])).toBe(GcgActionResult.Done);
  });
});

describe("conqueror of Evil: Guardian Yaksha", () => {
  test("it equips to Xiao while she is active, and has her use Bane of All Evil at once", () => {
    expect.hasAssertions();

    const xiao = createCharacterState(XIAO_ID);
    xiao.character.skills = [BANE_OF_ALL_EVIL];
    const context = { duel: createDuel([createSideState([xiao]), createSideState([])]), sideIndex: 0 };

    expect(conquerorOfEvilGuardianYaksha.canPlay?.(context, 0)).toBe(true);
    expect(conquerorOfEvilGuardianYaksha.skillOnPlay?.(context, 0)).toStrictEqual(BANE_OF_ALL_EVIL);
  });

  test("while Xiao has Yaksha's Mask, Lemniscatic Wind Cycling costs one Anemo die less, twice per attachment", () => {
    expect.hasAssertions();

    const xiao = { ...createCharacterState(XIAO_ID), statuses: [createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask)] };
    const duel = createDuel([createSideState([xiao]), createSideState([])]);
    const context = { characterIndex: 0, duel, sideIndex: 0 };
    const zoneCard = createGcgZoneCard(CONQUEROR_OF_EVIL_ID, conquerorOfEvilGuardianYaksha);
    const subject = { costs: [], element: Element.Anemo, skill: LEMNISCATIC_WIND_CYCLING };
    const reduction = { count: 1, element: Element.Anemo };

    expect(conquerorOfEvilGuardianYaksha.reduceCost?.(context, subject, zoneCard)).toStrictEqual(reduction);
    conquerorOfEvilGuardianYaksha.onCostPaid?.(context, subject, zoneCard);
    expect(conquerorOfEvilGuardianYaksha.reduceCost?.(context, subject, zoneCard)).toStrictEqual(reduction);
    conquerorOfEvilGuardianYaksha.onCostPaid?.(context, subject, zoneCard);
    expect(conquerorOfEvilGuardianYaksha.reduceCost?.(context, subject, zoneCard)).toBeUndefined();
  });

  test("without Yaksha's Mask, or for any other skill, nothing is reduced", () => {
    expect.hasAssertions();

    const bare = createDuel([createSideState([createCharacterState(XIAO_ID)]), createSideState([])]);
    const zoneCard = createGcgZoneCard(CONQUEROR_OF_EVIL_ID, conquerorOfEvilGuardianYaksha);
    expect(
      conquerorOfEvilGuardianYaksha.reduceCost?.(
        { characterIndex: 0, duel: bare, sideIndex: 0 },
        { costs: [], element: Element.Anemo, skill: LEMNISCATIC_WIND_CYCLING },
        zoneCard,
      ),
    ).toBeUndefined();

    const xiao = { ...createCharacterState(XIAO_ID), statuses: [createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask)] };
    const masked = createDuel([createSideState([xiao]), createSideState([])]);
    expect(
      conquerorOfEvilGuardianYaksha.reduceCost?.(
        { characterIndex: 0, duel: masked, sideIndex: 0 },
        { costs: [], element: Element.Anemo, skill: BANE_OF_ALL_EVIL },
        zoneCard,
      ),
    ).toBeUndefined();
  });
});

describe("lithic Spear", () => {
  test("it deals 1 more DMG to its pole user", () => {
    expect.hasAssertions();

    const duel = createDuel([createSideState([createLiyueCharacter(SHENHE_ID, "POLE")]), createSideState([])]);
    const zoneCard = createGcgZoneCard(LITHIC_SPEAR_ID, lithicSpear);

    expect(
      lithicSpear.modifyDamageDealt?.(
        { duel, sideIndex: 0 },
        { damageType: GcgDamageKind.Physical, value: 2 },
        zoneCard,
      ),
    ).toStrictEqual({ damageType: GcgDamageKind.Physical, value: 3 });
  });

  test("when played, it grants its wielder a Shield point for each Liyue party member", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([
        createLiyueCharacter(SHENHE_ID, "POLE"),
        createLiyueCharacter(1_104, "CLAYMORE"),
        createCharacterState(1_202),
      ]),
      createSideState([]),
    ]);

    lithicSpear.play?.({ duel, sideIndex: 0 }, 0, undefined);
    expect(takeOne(duel.sides, 0).characters.map(({ shield }) => shield)).toStrictEqual([2, 0, 0]);
  });

  test("the shield it grants stops at the shield limit", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([
        createLiyueCharacter(SHENHE_ID, "POLE"),
        createLiyueCharacter(1_104, "CLAYMORE"),
        createLiyueCharacter(1_504, "POLE"),
      ]),
      createSideState([]),
    ]);

    lithicSpear.play?.({ duel, sideIndex: 0 }, 0, undefined);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).shield).toBe(GCG_SHIELD_LIMIT);
  });
});

describe("vermillion Hereafter", () => {
  test("a Normal Attack spends one die less, once per Round", () => {
    expect.hasAssertions();

    const zoneCard = createGcgZoneCard(VERMILLION_HEREAFTER_ID, vermillionHereafter);
    const duel = createDuel([
      createSideState([{ ...createCharacterState(1_104), equipments: [zoneCard] }]),
      createSideState([]),
    ]);
    const context = { characterIndex: 0, duel, sideIndex: 0 };
    const subject = { costs: [], element: Element.Cryo, skill: KABUKI };

    expect(vermillionHereafter.reduceCost?.(context, subject, zoneCard)).toStrictEqual({ count: 1 });
    vermillionHereafter.onCostPaid?.(context, subject, zoneCard);
    expect(vermillionHereafter.reduceCost?.(context, subject, zoneCard)).toBeUndefined();
  });

  test("a Talent card spends one die less, while an Elemental Skill and other cards do not", () => {
    expect.hasAssertions();

    const zoneCard = createGcgZoneCard(VERMILLION_HEREAFTER_ID, vermillionHereafter);
    const duel = createDuel([createSideState([createCharacterState(1_104)]), createSideState([])]);
    const context = { characterIndex: 0, duel, sideIndex: 0 };

    expect(
      vermillionHereafter.reduceCost?.(context, { card: TALENT_CARD, costs: [], element: Element.Cryo }, zoneCard),
    ).toStrictEqual({ count: 1 });
    expect(
      vermillionHereafter.reduceCost?.(context, { costs: [], element: Element.Cryo, skill: HYOUKA }, zoneCard),
    ).toBeUndefined();
    expect(
      vermillionHereafter.reduceCost?.(context, { card: EVENT_CARD, costs: [], element: Element.Cryo }, zoneCard),
    ).toBeUndefined();
  });

  test("after a character is switched to, she deals 1 more Normal Attack DMG this Round", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([
        {
          ...createCharacterState(1_104),
          equipments: [createGcgZoneCard(VERMILLION_HEREAFTER_ID, vermillionHereafter)],
        },
        createCharacterState(1_504),
      ]),
      createSideState([createCharacterState(1_202)]),
    ]);

    switchGcgActiveCharacter(duel, 0, 1);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([7]);
  });
});

describe("stone and Contracts", () => {
  test("when the next Action Phase begins, it creates 3 Omni dice and draws a card", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(1_104)]);
    side.drawPile = [DRAWN_CARD_ID];
    const duel = createDuel([side, createSideState([])]);

    stoneAndContracts.play?.({ duel, sideIndex: 0 }, undefined);
    expect(side.onstages).toStrictEqual([createGcgZoneCard(STONE_AND_CONTRACTS_ID, stoneAndContracts)]);
    runGcgActionPhase(duel);
    expect(side).toMatchObject({
      dice: [GcgDieFace.Omni, GcgDieFace.Omni, GcgDieFace.Omni],
      hand: [DRAWN_CARD_ID],
      onstages: [],
    });
  });
});

describe("elemental Resonance: Shattering Ice", () => {
  test("it can be played only with two Cryo characters on its side", () => {
    expect.hasAssertions();

    const one = createDuel([createSideState([createCharacterState(1_202)]), createSideState([])]);
    const two = createDuel([
      createSideState([createCharacterState(1_202), createCharacterState(1_104)]),
      createSideState([]),
    ]);

    expect(shatteringIce.canPlay?.({ duel: one, sideIndex: 0 }, undefined)).toBe(false);
    expect(shatteringIce.canPlay?.({ duel: two, sideIndex: 0 }, undefined)).toBe(true);
  });

  test("the active character deals 2 more DMG to her next instance, and no more", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(1_202), createCharacterState(1_104)]),
      createSideState([createCharacterState(1_202)]),
    ]);

    shatteringIce.play?.({ duel, sideIndex: 0 }, undefined);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([4]);
  });
});

describe("liu Su", () => {
  test("after a switch to a character with no Energy, she gives that character 1 Energy, once per Round", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(SHENHE_ID), createCharacterState(1_104)]);
    side.supports.push(createGcgZoneCard(LIU_SU_ID, liuSu));
    const duel = createDuel([side, createSideState([])]);

    switchGcgActiveCharacter(duel, 0, 1);
    expect(side.characters.map(({ energy }) => energy)).toStrictEqual([0, 1]);
    switchGcgActiveCharacter(duel, 0, 0);
    expect(side.characters.map(({ energy }) => energy)).toStrictEqual([0, 1]);
    expect(takeOne(side.supports, 0).usages).toBe(1);
  });

  test("a character who has Energy keeps it, and the use is not spent", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(SHENHE_ID), createCharacterState(1_104)]);
    takeOne(side.characters, 1).energy = 2;
    side.supports.push(createGcgZoneCard(LIU_SU_ID, liuSu));
    const duel = createDuel([side, createSideState([])]);

    switchGcgActiveCharacter(duel, 0, 1);
    expect({
      energies: side.characters.map(({ energy }) => energy),
      usages: takeOne(side.supports, 0).usages,
    }).toStrictEqual({ energies: [0, 2], usages: 2 });
  });
});

describe("dunyarzad", () => {
  test("a companion played spends one die less, once per Round, and a card that is not a companion spends none less", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(SHENHE_ID)]);
    side.supports.push(createGcgZoneCard(DUNYARZAD_ID, dunyarzad));
    const zoneCard = takeOne(side.supports, 0);
    const context = { duel: createDuel([side, createSideState([])]), sideIndex: 0 };
    const companionSubject = { card: createCompanion(LIU_SU_ID), costs: [], element: Element.Cryo };

    expect(dunyarzad.reduceCost?.(context, companionSubject, zoneCard)).toStrictEqual({ count: 1 });
    dunyarzad.onCostPaid?.(context, companionSubject, zoneCard);
    expect(dunyarzad.reduceCost?.(context, companionSubject, zoneCard)).toBeUndefined();
    expect(
      dunyarzad.reduceCost?.(
        context,
        { card: { ...TALENT_CARD, kind: GcgCardKind.Support }, costs: [], element: Element.Cryo },
        zoneCard,
      ),
    ).toBeUndefined();
  });

  test("a companion played through the hand is paid for at one die less", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(SHENHE_ID)]);
    side.supports.push(createGcgZoneCard(DUNYARZAD_ID, dunyarzad));
    side.cards.push({ ...createCompanion(LIU_SU_ID), costs: [{ count: 1, kind: GcgCostKind.Unaligned }] });
    side.hand.push(LIU_SU_ID);
    const duel = createDuel([side, createSideState([])]);

    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect(side.supports.map(({ cardId }) => cardId)).toStrictEqual([DUNYARZAD_ID, LIU_SU_ID]);
  });

  test("after a companion is played, it draws a random companion from the pile, once per match", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(SHENHE_ID)]);
    side.supports.push(createGcgZoneCard(DUNYARZAD_ID, dunyarzad));
    side.cards.push({ ...TALENT_CARD, id: PLAIN_SUPPORT_ID, kind: GcgCardKind.Support }, createCompanion(RANA_ID), {
      ...createCompanion(LIU_SU_ID),
      costs: [{ count: 1, kind: GcgCostKind.Unaligned }],
    });
    side.drawPile.push(PLAIN_SUPPORT_ID, RANA_ID, LIU_SU_ID);
    side.hand.push(LIU_SU_ID, LIU_SU_ID);
    side.dice.push(Element.Cryo, Element.Cryo);
    const duel = createDuel([side, createSideState([])]);

    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect({ drawPile: side.drawPile, hand: side.hand }).toStrictEqual({
      drawPile: [PLAIN_SUPPORT_ID, LIU_SU_ID],
      hand: [LIU_SU_ID, RANA_ID],
    });
    expect(playGcgCard(duel, 0, 0, undefined, [0])).toBe(GcgActionResult.Done);
    expect({ drawPile: side.drawPile, hand: side.hand }).toStrictEqual({
      drawPile: [PLAIN_SUPPORT_ID, LIU_SU_ID],
      hand: [RANA_ID],
    });
  });
});

describe("rana", () => {
  test("after an Elemental Skill, it creates a die of the next off-field character's element, once per Round", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(SHENHE_ID), createElementCharacter(XIAO_ID, Element.Anemo)]);
    side.supports.push(createGcgZoneCard(RANA_ID, rana));
    const duel = createDuel([side, createSideState([createCharacterState(1_202)])]);

    runGcgSkillUse({ duel, sideIndex: 0 }, HYOUKA);
    expect(side.dice).toStrictEqual([Element.Anemo]);
    runGcgSkillUse({ duel, sideIndex: 0 }, HYOUKA);
    expect(side.dice).toStrictEqual([Element.Anemo]);
  });

  test("it skips a defeated character when it finds the next off-field one", () => {
    expect.hasAssertions();

    const side = createSideState([
      createCharacterState(SHENHE_ID),
      { ...createCharacterState(1_104), hp: 0 },
      createElementCharacter(XIAO_ID, Element.Anemo),
    ]);
    side.supports.push(createGcgZoneCard(RANA_ID, rana));
    const duel = createDuel([side, createSideState([createCharacterState(1_202)])]);

    runGcgSkillUse({ duel, sideIndex: 0 }, HYOUKA);
    expect(side.dice).toStrictEqual([Element.Anemo]);
  });

  test("a Normal Attack, or an opponent's Elemental Skill, creates no die", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(SHENHE_ID), createElementCharacter(XIAO_ID, Element.Anemo)]);
    side.supports.push(createGcgZoneCard(RANA_ID, rana));
    const duel = createDuel([side, createSideState([createCharacterState(1_202)])]);

    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    expect(side.dice).toStrictEqual([]);
    duel.actingSideIndex = 1;
    runGcgSkillUse({ duel, sideIndex: 1 }, HYOUKA);
    expect(side.dice).toStrictEqual([]);
  });
});

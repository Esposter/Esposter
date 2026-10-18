import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { divineMaidensDeliverance } from "#src/services/gcg/cards/divineMaidensDeliverance";
import { ICY_QUILL_ID, icyQuill } from "#src/services/gcg/cards/icyQuill";
import { MYSTICAL_ABANDON_ID, mysticalAbandon } from "#src/services/gcg/cards/mysticalAbandon";
import { springSpiritSummoning } from "#src/services/gcg/cards/springSpiritSummoning";
import { TALISMAN_SPIRIT_ID, talismanSpirit } from "#src/services/gcg/cards/talismanSpirit";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
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

describe("spring Spirit Summoning", () => {
  test("it deals 2 Cryo DMG, then creates an Icy Quill on its side", () => {
    expect.hasAssertions();

    const duel = createDuel([createSideState([createCharacterState(SHENHE_ID)]), createSideState([])]);
    const context = { duel, sideIndex: 0 };

    expect(springSpiritSummoning.getDamage?.(context)).toStrictEqual({ damageType: Element.Cryo, value: 2 });
    springSpiritSummoning.afterDamage?.(context);
    expect(takeOne(duel.sides, 0).onstages).toStrictEqual([createGcgZoneCard(ICY_QUILL_ID, icyQuill)]);
  });

  test("an Icy Quill already on its side is refreshed rather than doubled", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(SHENHE_ID)]);
    side.onstages.push({ ...createGcgZoneCard(ICY_QUILL_ID, icyQuill), usages: 1 });
    const duel = createDuel([side, createSideState([])]);

    springSpiritSummoning.afterDamage?.({ duel, sideIndex: 0 });
    expect(side.onstages).toStrictEqual([createGcgZoneCard(ICY_QUILL_ID, icyQuill)]);
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

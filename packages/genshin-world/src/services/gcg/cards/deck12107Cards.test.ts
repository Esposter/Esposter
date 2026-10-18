import type { GcgCharacter } from "#src/models/gcg/GcgCharacter";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { breastplate } from "#src/services/gcg/cards/breastplate";
import { fatalRainscreen } from "#src/services/gcg/cards/fatalRainscreen";
import { fullPlate } from "#src/services/gcg/cards/fullPlate";
import { rainbowBladework } from "#src/services/gcg/cards/rainbowBladework";
import { raincutter } from "#src/services/gcg/cards/raincutter";
import { rainSword } from "#src/services/gcg/cards/rainSword";
import { infusedStonehide } from "#src/services/gcg/cards/infusedStonehide";
import { stoneForce } from "#src/services/gcg/cards/stoneForce";
import { stonehide } from "#src/services/gcg/cards/stonehide";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { listGcgStartingStatuses } from "#src/services/gcg/effects/listGcgStartingStatuses";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

const createCharacterState = (id: number): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Hydro,
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

describe("rain Sword", () => {
  test("the active character takes one less DMG when it receives at least 3, for two usages", () => {
    expect.hasAssertions();
    const RAIN_SWORD_ID = 112_021;
    const context: GcgEffectContext = {
      duel: createDuel([createSideState([createCharacterState(1202)]), createSideState([])]),
      sideIndex: 0,
    };
    const zoneCard = createGcgZoneCard(RAIN_SWORD_ID, rainSword);
    expect(rainSword.modifyDamageReceived?.(context, 2, zoneCard)).toBe(2);
    expect(zoneCard.usages).toBe(2);
    expect(rainSword.modifyDamageReceived?.(context, 3, zoneCard)).toBe(2);
    expect(zoneCard.usages).toBe(1);
    expect(rainSword.modifyDamageReceived?.(context, 3, zoneCard)).toBe(2);
    expect(zoneCard.usages).toBe(0);
  });
});

describe("rainbow Bladework", () => {
  const NORMAL_ATTACK: GcgSkill = {
    costs: [],
    effect: "Char_Skill_12021",
    energyGain: 1,
    id: 12_021,
    kind: GcgSkillKind.NormalAttack,
  };
  const ELEMENTAL_SKILL: GcgSkill = {
    costs: [],
    effect: "Char_Skill_12022",
    energyGain: 1,
    id: 12_022,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("after the active character uses a Normal Attack it deals 1 Hydro DMG, for three usages", () => {
    expect.hasAssertions();
    const RAINBOW_BLADEWORK_ID = 112_022;
    const context: GcgEffectContext = {
      duel: createDuel([createSideState([createCharacterState(1202)]), createSideState([])]),
      sideIndex: 0,
    };
    const zoneCard = createGcgZoneCard(RAINBOW_BLADEWORK_ID, rainbowBladework);
    expect(rainbowBladework.onSkillUsed?.(context, NORMAL_ATTACK, zoneCard, [])).toStrictEqual({
      damageType: Element.Hydro,
      value: 1,
    });
    expect(zoneCard.usages).toBe(2);
    rainbowBladework.onSkillUsed?.(context, NORMAL_ATTACK, zoneCard, []);
    rainbowBladework.onSkillUsed?.(context, NORMAL_ATTACK, zoneCard, []);
    expect(zoneCard.usages).toBe(0);
    expect(rainbowBladework.onSkillUsed?.(context, NORMAL_ATTACK, zoneCard, [])).toBeUndefined();
  });

  test("an elemental skill does not trigger it, and spends no usage", () => {
    expect.hasAssertions();
    const RAINBOW_BLADEWORK_ID = 112_022;
    const context: GcgEffectContext = {
      duel: createDuel([createSideState([createCharacterState(1202)]), createSideState([])]),
      sideIndex: 0,
    };
    const zoneCard = createGcgZoneCard(RAINBOW_BLADEWORK_ID, rainbowBladework);
    expect(rainbowBladework.onSkillUsed?.(context, ELEMENTAL_SKILL, zoneCard, [])).toBeUndefined();
    expect(zoneCard.usages).toBe(3);
  });
});

describe("fatal Rainscreen", () => {
  test("the skill deals 2 Hydro DMG, puts Hydro on its character, and creates a Rain Sword onstage", () => {
    expect.hasAssertions();
    const FATAL_RAINSCREEN_SKILL: GcgSkill = {
      costs: [],
      effect: "Char_Skill_12022",
      energyGain: 1,
      id: 12_022,
      kind: GcgSkillKind.ElementalSkill,
    };
    const RAIN_SWORD_ID = 112_021;
    const duel = createDuel([
      createSideState([createCharacterState(1202)]),
      createSideState([createCharacterState(1203)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FATAL_RAINSCREEN_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([8]);
    expect(takeOne(duel.sides, 0).characters.map(({ aura }) => aura)).toStrictEqual([Element.Hydro]);
    expect(takeOne(duel.sides, 0).onstages.map(({ cardId }) => cardId)).toStrictEqual([RAIN_SWORD_ID]);
  });
});

describe("raincutter", () => {
  test("the skill deals 2 Hydro DMG, puts Hydro on its character, and creates a Rainbow Bladework onstage", () => {
    expect.hasAssertions();
    const RAINCUTTER_SKILL: GcgSkill = {
      costs: [],
      effect: "Char_Skill_12023",
      energyGain: 0,
      id: 12_023,
      kind: GcgSkillKind.ElementalBurst,
    };
    const RAINBOW_BLADEWORK_ID = 112_022;
    const duel = createDuel([
      createSideState([createCharacterState(1202)]),
      createSideState([createCharacterState(1203)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, RAINCUTTER_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([8]);
    expect(takeOne(duel.sides, 0).characters.map(({ aura }) => aura)).toStrictEqual([Element.Hydro]);
    expect(takeOne(duel.sides, 0).onstages.map(({ cardId }) => cardId)).toStrictEqual([RAINBOW_BLADEWORK_ID]);
  });
});

describe("full Plate", () => {
  const FULL_PLATE_ID = 116_021;
  const createShieldedDuel = (shield: number): GcgDuel =>
    createDuel([createSideState([{ ...createCharacterState(1602), shield }]), createSideState([])]);

  test("while its active character holds a shield, the Physical DMG it takes is halved, rounded up", () => {
    expect.hasAssertions();
    const context: GcgEffectContext = { duel: createShieldedDuel(2), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(FULL_PLATE_ID, fullPlate);
    expect(fullPlate.modifyDamageReceived?.(context, 3, zoneCard, GcgDamageKind.Physical)).toBe(2);
    expect(fullPlate.modifyDamageReceived?.(context, 3, zoneCard, Element.Pyro)).toBe(3);
  });

  test("without a shield on its active character, no DMG is halved", () => {
    expect.hasAssertions();
    const context: GcgEffectContext = { duel: createShieldedDuel(0), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(FULL_PLATE_ID, fullPlate);
    expect(fullPlate.modifyDamageReceived?.(context, 3, zoneCard, GcgDamageKind.Physical)).toBe(3);
  });

  test("at the end phase it is spent once no character on its side holds a shield", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(FULL_PLATE_ID, fullPlate);
    fullPlate.onEndPhase?.({ duel: createShieldedDuel(1), sideIndex: 0 }, zoneCard);
    expect(zoneCard.usages).toBe(1);
    fullPlate.onEndPhase?.({ duel: createShieldedDuel(0), sideIndex: 0 }, zoneCard);
    expect(zoneCard.usages).toBe(0);
  });
});

describe("breastplate", () => {
  test("the skill deals 1 Geo DMG, grants its character 2 Shield points, and creates a Full Plate onstage", () => {
    expect.hasAssertions();
    const BREASTPLATE_SKILL: GcgSkill = {
      costs: [],
      effect: "Char_Skill_16022",
      energyGain: 1,
      id: 16_022,
      kind: GcgSkillKind.ElementalSkill,
    };
    const FULL_PLATE_ID = 116_021;
    const duel = createDuel([
      createSideState([createCharacterState(1602)]),
      createSideState([createCharacterState(1203)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, BREASTPLATE_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([9]);
    expect(takeOne(duel.sides, 0).characters.map(({ shield }) => shield)).toStrictEqual([2]);
    expect(takeOne(duel.sides, 0).onstages.map(({ cardId }) => cardId)).toStrictEqual([FULL_PLATE_ID]);
  });
});

describe("stonehide", () => {
  const STONEHIDE_ID = 126_011;
  const createStonehideDuel = (): GcgDuel =>
    createDuel([createSideState([createCharacterState(2601)]), createSideState([])]);

  test("the character takes one less DMG, for three usages", () => {
    expect.hasAssertions();
    const context: GcgEffectContext = { duel: createStonehideDuel(), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(STONEHIDE_ID, stonehide);
    expect(stonehide.modifyDamageReceived?.(context, 3, zoneCard, Element.Pyro)).toBe(2);
    expect(zoneCard.usages).toBe(2);
  });

  test("a Geo DMG it decreases spends a second usage", () => {
    expect.hasAssertions();
    const context: GcgEffectContext = { duel: createStonehideDuel(), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(STONEHIDE_ID, stonehide);
    expect(stonehide.modifyDamageReceived?.(context, 3, zoneCard, Element.Geo)).toBe(2);
    expect(zoneCard.usages).toBe(1);
  });

  test("a hit of no DMG is not decreased and spends nothing", () => {
    expect.hasAssertions();
    const context: GcgEffectContext = { duel: createStonehideDuel(), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(STONEHIDE_ID, stonehide);
    expect(stonehide.modifyDamageReceived?.(context, 0, zoneCard, Element.Geo)).toBe(0);
    expect(zoneCard.usages).toBe(3);
  });
});

describe("stone Force", () => {
  const STONE_FORCE_ID = 126_012;
  const STONEHIDE_ID = 126_011;
  const createStoneForceDuel = (statuses: GcgZoneCard[]): GcgDuel =>
    createDuel([
      createSideState([{ ...createCharacterState(2601), statuses }]),
      createSideState([createCharacterState(1203)]),
    ]);

  test("the character's Physical DMG is converted to Geo, and its first DMG of the round is one more", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(STONE_FORCE_ID, stoneForce);
    const context: GcgEffectContext = { duel: createStoneForceDuel([zoneCard]), sideIndex: 0 };
    expect(
      stoneForce.modifyDamageDealt?.(context, { damageType: GcgDamageKind.Physical, value: 2 }, zoneCard),
    ).toStrictEqual({ damageType: Element.Geo, value: 3 });
    expect(
      stoneForce.modifyDamageDealt?.(context, { damageType: GcgDamageKind.Physical, value: 2 }, zoneCard),
    ).toStrictEqual({ damageType: Element.Geo, value: 2 });
  });

  test("at the end phase it is spent once its character holds no Stonehide", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(STONE_FORCE_ID, stoneForce);
    const withStonehide = createGcgZoneCard(STONEHIDE_ID, stonehide);
    stoneForce.onEndPhase?.(
      { characterIndex: 0, duel: createStoneForceDuel([zoneCard, withStonehide]), sideIndex: 0 },
      zoneCard,
    );
    expect(zoneCard.usages).toBe(1);
    stoneForce.onEndPhase?.({ characterIndex: 0, duel: createStoneForceDuel([zoneCard]), sideIndex: 0 }, zoneCard);
    expect(zoneCard.usages).toBe(0);
  });
});

describe("infused Stonehide", () => {
  test("when the battle begins its character gains Stonehide and Stone Force", () => {
    expect.hasAssertions();
    const INFUSED_STONEHIDE_PASSIVE: GcgSkill = {
      costs: [],
      effect: "Char_Skill_26014",
      energyGain: 0,
      id: 26_014,
      kind: GcgSkillKind.Passive,
    };
    const character: GcgCharacter = { ...createCharacterState(2601).character, skills: [INFUSED_STONEHIDE_PASSIVE] };
    expect(listGcgStartingStatuses(character).map(({ cardId }) => cardId)).toStrictEqual([126_011, 126_012]);
  });
});

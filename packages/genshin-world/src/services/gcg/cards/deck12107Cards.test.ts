import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { fatalRainscreen } from "#src/services/gcg/cards/fatalRainscreen";
import { rainbowBladework } from "#src/services/gcg/cards/rainbowBladework";
import { raincutter } from "#src/services/gcg/cards/raincutter";
import { rainSword } from "#src/services/gcg/cards/rainSword";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
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

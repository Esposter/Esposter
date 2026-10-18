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
import { rainbowBladework } from "#src/services/gcg/cards/rainbowBladework";
import { rainSword } from "#src/services/gcg/cards/rainSword";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
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

describe(rainSword, () => {
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

describe(rainbowBladework, () => {
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

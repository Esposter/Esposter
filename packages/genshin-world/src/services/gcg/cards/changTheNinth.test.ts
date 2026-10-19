import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgReactionKind } from "#src/models/gcg/GcgReactionKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { changTheNinth } from "#src/services/gcg/cards/changTheNinth";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { describe, expect, test } from "vitest";

const createSide = (drawPile: number[]): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters: [createGcgCharacterState()],
  deckCardIds: [],
  dice: [],
  drawPile,
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

describe("changTheNinth", () => {
  const CHANG_THE_NINTH_ID = 322_009;
  const SKILL: GcgSkill = { costs: [], effect: "", energyGain: 0, id: 1, kind: GcgSkillKind.ElementalSkill };

  // A skill of the side at index 0 has dealt the hits: Chang the Ninth on that side hears it
  const hearSkill = (side: GcgSideState, zoneCard: GcgZoneCard, dealt: GcgDealtDamage[]): void => {
    const duel: GcgDuel = {
      actingSideIndex: 0,
      cardModules: GcgCardIdModuleMap,
      firstSideIndex: 0,
      nextFirstSideIndex: 0,
      phase: GcgPhase.Action,
      random: () => 0,
      round: 1,
      rule: { drawCount: 2, handCardLimit: 10, reactions: [] },
      sides: [side, createSide([])],
      skillModules: GcgEffectNameSkillModuleMap,
    };
    const context: GcgEffectContext & { userSideIndex: number } = { duel, sideIndex: 0, userSideIndex: 0 };
    changTheNinth.onAnySkillUsed?.(context, SKILL, zoneCard, dealt);
  };

  test("should gain an Inspiration when the skill deals Physical damage", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(CHANG_THE_NINTH_ID, changTheNinth);
    hearSkill(createSide([]), zoneCard, [{ damageType: GcgDamageKind.Physical }]);
    expect({ counter: zoneCard.counter, usages: zoneCard.usages }).toStrictEqual({ counter: 1, usages: 1 });
  });

  test("should gain an Inspiration when the skill deals Piercing damage", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(CHANG_THE_NINTH_ID, changTheNinth);
    hearSkill(createSide([]), zoneCard, [{ damageType: GcgDamageKind.Piercing }]);
    expect({ counter: zoneCard.counter, usages: zoneCard.usages }).toStrictEqual({ counter: 1, usages: 1 });
  });

  test("should gain an Inspiration when the skill triggers an Elemental Reaction", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(CHANG_THE_NINTH_ID, changTheNinth);
    hearSkill(createSide([]), zoneCard, [{ damageType: Element.Pyro, reaction: GcgReactionKind.Melt }]);
    expect({ counter: zoneCard.counter, usages: zoneCard.usages }).toStrictEqual({ counter: 1, usages: 1 });
  });

  test("should gain no Inspiration when the skill deals only Elemental damage with no reaction", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(CHANG_THE_NINTH_ID, changTheNinth);
    hearSkill(createSide([]), zoneCard, [{ damageType: Element.Pyro }]);
    expect({ counter: zoneCard.counter, usages: zoneCard.usages }).toStrictEqual({ counter: 0, usages: 1 });
  });

  test("should be discarded and draw two cards from its side at the third Inspiration", () => {
    expect.hasAssertions();
    const zoneCard = { ...createGcgZoneCard(CHANG_THE_NINTH_ID, changTheNinth), counter: 2 };
    const side = createSide([801, 802, 803]);
    hearSkill(side, zoneCard, [{ damageType: GcgDamageKind.Physical }]);
    expect({ drawPile: side.drawPile, hand: side.hand, usages: zoneCard.usages }).toStrictEqual({
      drawPile: [803],
      hand: [801, 802],
      usages: 0,
    });
  });
});

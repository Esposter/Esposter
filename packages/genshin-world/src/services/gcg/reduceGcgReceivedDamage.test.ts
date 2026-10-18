import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { iceLotus } from "#src/services/gcg/cards/iceLotus";
import { lotusFlowerCrisp } from "#src/services/gcg/cards/lotusFlowerCrisp";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { reduceGcgReceivedDamage } from "#src/services/gcg/reduceGcgReceivedDamage";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { LOTUS_FLOWER_CRISP_ID } from "#src/services/gcg/cards/constants";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

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
  cardModules: GcgCardIdModuleMap,
  skillModules: GcgEffectNameSkillModuleMap,
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

describe(reduceGcgReceivedDamage, () => {
  test("an onstage card reduces the damage its side's active character takes, and spends a usage", () => {
    expect.hasAssertions();
    const ICE_LOTUS_ID = 111_012;
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: 1701, element: Element.Dendro } })]),
      createSideState([createGcgCharacterState({ character: { id: 1203, element: Element.Dendro } })]),
    ]);
    const zoneCard = createGcgZoneCard(ICE_LOTUS_ID, iceLotus);
    takeOne(duel.sides, 0).onstages.push(zoneCard);
    const damage = reduceGcgReceivedDamage(duel, 0, { damageType: Element.Cryo, value: 3 });
    expect(damage).toStrictEqual({ damageType: Element.Cryo, value: 2 });
    expect(zoneCard.usages).toBe(1);
  });

  test("a status on the active character reduces the damage it takes", () => {
    expect.hasAssertions();
    const character = {
      ...createGcgCharacterState({ character: { id: 1701, element: Element.Dendro } }),
      statuses: [createGcgZoneCard(LOTUS_FLOWER_CRISP_ID, lotusFlowerCrisp)],
    };
    const duel = createDuel([
      createSideState([character]),
      createSideState([createGcgCharacterState({ character: { id: 1203, element: Element.Dendro } })]),
    ]);
    const damage = reduceGcgReceivedDamage(duel, 0, { damageType: Element.Pyro, value: 5 });
    expect(damage).toStrictEqual({ damageType: Element.Pyro, value: 2 });
  });

  test("a status on a standby character does not reduce the damage the active one takes", () => {
    expect.hasAssertions();
    const standby = {
      ...createGcgCharacterState({ character: { id: 1403, element: Element.Dendro } }),
      statuses: [createGcgZoneCard(LOTUS_FLOWER_CRISP_ID, lotusFlowerCrisp)],
    };
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: 1701, element: Element.Dendro } }), standby]),
      createSideState([createGcgCharacterState({ character: { id: 1203, element: Element.Dendro } })]),
    ]);
    const damage = reduceGcgReceivedDamage(duel, 0, { damageType: Element.Pyro, value: 5 });
    expect(damage).toStrictEqual({ damageType: Element.Pyro, value: 5 });
  });
});

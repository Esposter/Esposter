import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { stonehide } from "#src/services/gcg/cards/stonehide";
import { ushi } from "#src/services/gcg/cards/ushi";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { reduceGcgReceivedDamage } from "#src/services/gcg/reduceGcgReceivedDamage";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { ARATAKI_ITTO_ID, STONEHIDE_ID, USHI_ID } from "#src/services/gcg/cards/constants";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";

const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

const createCharacterState = (id: number): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Geo,
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

describe("ushi", () => {
  test("a hit Stonehide takes to 0 spends none of Ushi's usage, counter or Superlative attach", () => {
    expect.hasAssertions();

    const stonehideZoneCard = createGcgZoneCard(STONEHIDE_ID, stonehide);
    const ushiZoneCard = createGcgZoneCard(USHI_ID, ushi);
    const duel = createDuel([
      {
        ...createSideState([
          { ...createCharacterState(1), statuses: [stonehideZoneCard] },
          createCharacterState(ARATAKI_ITTO_ID),
        ]),
        summons: [ushiZoneCard],
      },
      createSideState([createCharacterState(1)]),
    ]);

    const reduced = reduceGcgReceivedDamage(duel, 0, { damageType: GcgDamageKind.Physical, value: 1 });
    const side = takeOne(duel.sides, 0);
    expect({
      damage: reduced.value,
      ittoStatusCount: takeOne(side.characters, 1).statuses.length,
      stonehideUsages: stonehideZoneCard.usages,
      ushi: { counter: ushiZoneCard.counter, usages: ushiZoneCard.usages },
    }).toStrictEqual({ damage: 0, ittoStatusCount: 0, stonehideUsages: 2, ushi: { counter: 1, usages: 0 } });
  });
});

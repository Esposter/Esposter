import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import {
  BLUSTERING_BLADE_ID,
  TRANSCENDENT_AUTOMATON_ID,
  VERMILLION_HEREAFTER_ID,
  VERMILLION_HEREAFTER_STATUS_ID,
} from "#src/services/gcg/cards/constants";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { transcendentAutomaton } from "#src/services/gcg/cards/transcendentAutomaton";
import { vermillionHereafter } from "#src/services/gcg/cards/vermillionHereafter";

const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

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

describe("transcendentAutomaton", () => {
  const BLUSTERING_BLADE: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Cryo_1",
    energyGain: 1,
    id: BLUSTERING_BLADE_ID,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("Blustering Blade's switch lands Vermillion Hereafter's status on the character switched in", () => {
    expect.hasAssertions();

    const zoneCard = createGcgZoneCard(TRANSCENDENT_AUTOMATON_ID, transcendentAutomaton);
    const duel = createDuel([
      createSideState([
        { ...createGcgCharacterState({ character: { id: 1, element: Element.Cryo } }), equipments: [zoneCard] },
        {
          ...createGcgCharacterState({ character: { id: 2, element: Element.Cryo } }),
          equipments: [createGcgZoneCard(VERMILLION_HEREAFTER_ID, vermillionHereafter)],
        },
      ]),
      createSideState([createGcgCharacterState({ character: { id: 1, element: Element.Cryo } })]),
    ]);
    transcendentAutomaton.onSkillUsed?.({ characterIndex: 0, duel, sideIndex: 0 }, BLUSTERING_BLADE, zoneCard, []);

    const side = takeOne(duel.sides, 0);
    expect({
      activeIndex: side.activeIndex,
      statusIds: side.characters.map(({ statuses }) => statuses.map(({ cardId }) => cardId)),
    }).toStrictEqual({ activeIndex: 1, statusIds: [[], [VERMILLION_HEREAFTER_STATUS_ID]] });
  });
});

import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgPlayChoice } from "#src/models/gcg/GcgPlayChoice";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { WAGNER_ID } from "#src/services/gcg/cards/constants";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { wagner } from "#src/services/gcg/cards/wagner";
import { GCG_TOSS_UP_CARD_ID } from "#src/services/gcg/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
import { takeOne } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

const createSide = (): GcgSideState => ({
  activeIndex: 0,
  cards: [
    {
      costs: [],
      descriptionTextId: 2,
      effects: [],
      id: GCG_TOSS_UP_CARD_ID,
      isLocation: false,
      kind: GcgCardKind.Event,
      nameTextId: 1,
    },
  ],
  characters: [createGcgCharacterState()],
  deckCardIds: [GCG_TOSS_UP_CARD_ID],
  dice: [],
  drawPile: [],
  hand: [GCG_TOSS_UP_CARD_ID],
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

const createDuel = (): GcgDuel => ({
  actingSideIndex: 0,
  cardModules: GcgCardIdModuleMap,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: { drawCount: 2, handCardLimit: 10, reactions: [] },
  sides: [createSide(), createSide()],
  skillModules: GcgEffectNameSkillModuleMap,
});

describe(playGcgCard, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("a support played again takes its own slot, and the one already on the field keeps its counter", () => {
    expect.hasAssertions();

    const duel = createDuel();
    const side = takeOne(duel.sides, 0);
    side.cards.push({
      costs: [],
      descriptionTextId: 2,
      effects: [],
      id: WAGNER_ID,
      isLocation: false,
      kind: GcgCardKind.Support,
      nameTextId: 1,
    });
    side.hand = [WAGNER_ID];
    side.supports.push({ ...createGcgZoneCard(WAGNER_ID, wagner), counter: 3 });

    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect(side.supports).toStrictEqual([
      { ...createGcgZoneCard(WAGNER_ID, wagner), counter: 3 },
      createGcgZoneCard(WAGNER_ID, wagner),
    ]);
  });

  test("should hand the card's play the choice it is played with as its third argument", () => {
    expect.hasAssertions();
    const play = vi.fn<NonNullable<GcgCardModule["play"]>>();
    vi.spyOn(GcgCardIdModuleMap, "get").mockReturnValue({ play });
    const duel = createDuel();
    const choice: GcgPlayChoice = { rerollDiceIndices: [[0], [2]] };
    expect(playGcgCard(duel, 0, 0, undefined, [], choice)).toBe(GcgActionResult.Done);
    expect(play.mock.calls).toStrictEqual([[{ duel, sideIndex: 0 }, undefined, choice]]);
  });

  test("should pass the turn after a combat action is played", () => {
    expect.hasAssertions();
    vi.spyOn(GcgCardIdModuleMap, "get").mockReturnValue({
      isCombatAction: true,
      play: vi.fn<NonNullable<GcgCardModule["play"]>>(),
    });
    const duel = createDuel();
    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect(duel.actingSideIndex).toBe(1);
  });

  test("should keep the turn after a fast action is played", () => {
    expect.hasAssertions();
    vi.spyOn(GcgCardIdModuleMap, "get").mockReturnValue({ play: vi.fn<NonNullable<GcgCardModule["play"]>>() });
    const duel = createDuel();
    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect(duel.actingSideIndex).toBe(0);
  });
});

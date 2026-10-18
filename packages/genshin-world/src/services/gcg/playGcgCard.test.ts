import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgPlayChoice } from "#src/models/gcg/GcgPlayChoice";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { WAGNER_ID, wagner } from "#src/services/gcg/cards/wagner";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
import { takeOne } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

const EVENT_ID = 332_003;

const createSide = (): GcgSideState => ({
  activeIndex: 0,
  cards: [
    {
      costs: [],
      descriptionTextId: 2,
      effects: [],
      id: EVENT_ID,
      isLocation: false,
      kind: GcgCardKind.Event,
      nameTextId: 1,
    },
  ],
  characters: [
    {
      aura: GcgAura.None,
      character: {
        descriptionTextId: 2,
        element: Element.Hydro,
        hp: 10,
        id: 1,
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
    },
  ],
  deckCardIds: [EVENT_ID],
  dice: [],
  drawPile: [],
  hand: [EVENT_ID],
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
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: { drawCount: 2, handCardLimit: 10, reactions: [] },
  sides: [createSide(), createSide()],
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

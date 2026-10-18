import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { archaicPetra } from "#src/services/gcg/cards/archaicPetra";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { runGcgRollPhase } from "#src/services/gcg/runGcgRollPhase";
import { describe, expect, test } from "vitest";

const ARCHAIC_PETRA_ID = 312_602;
const FULL_HP = 10;

const createCharacterState = (equipments: GcgCharacterState["equipments"] = []): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Geo,
    hp: FULL_HP,
    id: 1,
    maxEnergy: 3,
    nameTextId: 1,
    skills: [],
    weapon: "",
  },
  energy: 0,
  equipments,
  hp: FULL_HP,
  isFrozen: false,
  shield: 0,
  statuses: [],
});

const createSide = (characters: GcgCharacterState[], dice: Element[]) => ({
  activeIndex: 0,
  cards: [],
  characters,
  dice,
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

// A duel with the first side holding Archaic Petra on its active character and the given starting dice
const createDuel = (dice: Element[]): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: { handCardLimit: 10 } as GcgDuel["rule"],
  sides: [
    createSide([createCharacterState([createGcgZoneCard(ARCHAIC_PETRA_ID, archaicPetra)])], dice),
    createSide([createCharacterState()], []),
  ],
  winnerSideIndex: undefined,
});

const createTalentSubject = (costs: GcgCostSubject["costs"]): GcgCostSubject => ({
  card: { kind: GcgCardKind.Talent } as GcgCard,
  costs,
  element: Element.Geo,
});

describe("archaic Petra", () => {
  test("the two starting dice rolled are Geo, and the others are left as rolled", () => {
    expect.hasAssertions();
    const duel = createDuel([Element.Hydro, Element.Pyro, Element.Electro]);
    runGcgRollPhase(duel);
    expect(duel.sides[0].dice).toStrictEqual([Element.Geo, Element.Geo, Element.Electro]);
  });

  test("a talent card's Geo die is spent one less, once per round", () => {
    expect.hasAssertions();
    const duel = createDuel([]);
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    const subject = createTalentSubject([{ count: 2, element: Element.Geo, kind: GcgCostKind.Dice }]);
    const zoneCard = createGcgZoneCard(ARCHAIC_PETRA_ID, archaicPetra);
    expect(archaicPetra.reduceCost?.(context, subject, zoneCard)).toStrictEqual({ count: 1, element: Element.Geo });
    archaicPetra.onCostPaid?.(context, subject, zoneCard);
    expect(archaicPetra.reduceCost?.(context, subject, zoneCard)).toBeUndefined();
  });

  test("a cost of another element is not reduced", () => {
    expect.hasAssertions();
    const duel = createDuel([]);
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    const subject = createTalentSubject([{ count: 2, element: Element.Pyro, kind: GcgCostKind.Dice }]);
    expect(
      archaicPetra.reduceCost?.(context, subject, createGcgZoneCard(ARCHAIC_PETRA_ID, archaicPetra)),
    ).toBeUndefined();
  });
});

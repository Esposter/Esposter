import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { timaeus } from "#src/services/gcg/cards/timaeus";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { describe, expect, test } from "vitest";

const TIMAEUS_ID = 322_003;
const ARTIFACT_IDS = [401, 402, 403, 404, 405, 406];
const ACTION_ID = 501;
const HAND_CARD_LIMIT = 10;
const ARTIFACT_COST = 2;

const createCard = (id: number, kind: GcgCardKind): GcgCard => ({
  costs: kind === GcgCardKind.Artifact ? [{ count: ARTIFACT_COST, kind: GcgCostKind.Unaligned }] : [],
  descriptionTextId: 2,
  effects: [],
  id,
  isLocation: false,
  kind,
  nameTextId: 1,
});

const cards = [
  ...ARTIFACT_IDS.map((id) => createCard(id, GcgCardKind.Artifact)),
  createCard(ACTION_ID, GcgCardKind.Event),
];

const createSide = (deckCardIds: number[], drawPile: number[], hand: number[] = []): GcgSideState => ({
  activeIndex: 0,
  cards,
  characters: [],
  deckCardIds,
  dice: [],
  drawPile,
  hand,
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

const createDuel = (side: GcgSideState, random: () => number): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random,
  round: 1,
  rule: { drawCount: 2, handCardLimit: HAND_CARD_LIMIT, reactions: [] },
  sides: [side, createSide([], [])],
  winnerSideIndex: undefined,
});

const createArtifactSubject = (): GcgCostSubject => ({
  card: createCard(ARTIFACT_IDS[0], GcgCardKind.Artifact),
  costs: [{ count: ARTIFACT_COST, kind: GcgCostKind.Unaligned }],
  element: Element.Hydro,
});

describe(timaeus, () => {
  test("should come with two materials", () => {
    expect.hasAssertions();
    expect(createGcgZoneCard(TIMAEUS_ID, timaeus)).toStrictEqual({
      cardId: TIMAEUS_ID,
      counter: 2,
      rounds: 0,
      usages: 0,
    });
  });

  test("should gain one material at each end phase", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(TIMAEUS_ID, timaeus);
    const context: GcgEffectContext = { duel: createDuel(createSide([], []), () => 0), sideIndex: 0 };
    timaeus.onEndPhase?.(context, zoneCard);
    expect(zoneCard).toStrictEqual({ cardId: TIMAEUS_ID, counter: 3, rounds: 0, usages: 0 });
  });

  test("should draw a random artifact on play when the deck holds at least six artifacts", () => {
    expect.hasAssertions();
    const side = createSide(ARTIFACT_IDS, [ACTION_ID, ARTIFACT_IDS[1], ARTIFACT_IDS[2]]);
    const duel = createDuel(side, () => 0);
    timaeus.play?.({ duel, sideIndex: 0 }, undefined);
    expect({ drawPile: side.drawPile, hand: side.hand }).toStrictEqual({
      drawPile: [ACTION_ID, ARTIFACT_IDS[2]],
      hand: [ARTIFACT_IDS[1]],
    });
  });

  test("should draw nothing on play when the deck holds fewer than six artifacts", () => {
    expect.hasAssertions();
    const side = createSide(ARTIFACT_IDS.slice(0, 5), [ARTIFACT_IDS[1]]);
    timaeus.play?.({ duel: createDuel(side, () => 0), sideIndex: 0 }, undefined);
    expect({ drawPile: side.drawPile, hand: side.hand }).toStrictEqual({ drawPile: [ARTIFACT_IDS[1]], hand: [] });
  });

  test("should equip an artifact for free by spending materials equal to its cost, once per round", () => {
    expect.hasAssertions();
    const side = createSide([], []);
    const duel = createDuel(side, () => 0);
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    const zoneCard = { ...createGcgZoneCard(TIMAEUS_ID, timaeus), counter: ARTIFACT_COST };
    const subject = createArtifactSubject();
    expect(timaeus.reduceCost?.(context, subject, zoneCard)).toStrictEqual({ count: ARTIFACT_COST });
    timaeus.onCostPaid?.(context, subject, zoneCard);
    expect({ counter: zoneCard.counter, usedCardIds: side.usedCardIds }).toStrictEqual({
      counter: 0,
      usedCardIds: [TIMAEUS_ID],
    });
    expect(timaeus.reduceCost?.(context, subject, zoneCard)).toBeUndefined();
  });

  test("should not reduce an artifact's cost when the materials cannot cover it", () => {
    expect.hasAssertions();
    const context: GcgEffectContext = { duel: createDuel(createSide([], []), () => 0), sideIndex: 0 };
    const zoneCard = { ...createGcgZoneCard(TIMAEUS_ID, timaeus), counter: ARTIFACT_COST - 1 };
    expect(timaeus.reduceCost?.(context, createArtifactSubject(), zoneCard)).toBeUndefined();
  });
});

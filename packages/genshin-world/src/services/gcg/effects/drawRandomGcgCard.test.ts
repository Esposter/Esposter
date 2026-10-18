import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { drawRandomGcgCard } from "#src/services/gcg/effects/drawRandomGcgCard";
import { describe, expect, test } from "vitest";

const ARTIFACT_ID = 401;
const OTHER_ARTIFACT_ID = 402;
const ACTION_ID = 501;
const HAND_CARD_LIMIT = 10;

const createCard = (id: number, kind: GcgCardKind): GcgCard => ({
  costs: [{ count: 1, kind: GcgCostKind.Unaligned }],
  descriptionTextId: 2,
  effects: [],
  id,
  isLocation: false,
  kind,
  nameTextId: 1,
});

const createSide = (cards: GcgCard[], drawPile: number[]): GcgSideState => ({
  activeIndex: 0,
  cards,
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

describe(drawRandomGcgCard, () => {
  test("should draw a random card of the kind from the draw pile into the hand, and take it out of the pile", () => {
    expect.hasAssertions();
    const side = createSide(
      [
        createCard(ARTIFACT_ID, GcgCardKind.Artifact),
        createCard(ACTION_ID, GcgCardKind.Event),
        createCard(OTHER_ARTIFACT_ID, GcgCardKind.Artifact),
      ],
      [ACTION_ID, ARTIFACT_ID, OTHER_ARTIFACT_ID],
    );
    drawRandomGcgCard(side, GcgCardKind.Artifact, () => 0.99, HAND_CARD_LIMIT);
    expect({ drawPile: side.drawPile, hand: side.hand }).toStrictEqual({
      drawPile: [ACTION_ID, ARTIFACT_ID],
      hand: [OTHER_ARTIFACT_ID],
    });
  });

  test("should draw no card when the draw pile holds none of the kind", () => {
    expect.hasAssertions();
    const side = createSide([createCard(ACTION_ID, GcgCardKind.Event)], [ACTION_ID]);
    drawRandomGcgCard(side, GcgCardKind.Artifact, () => 0, HAND_CARD_LIMIT);
    expect({ drawPile: side.drawPile, hand: side.hand }).toStrictEqual({ drawPile: [ACTION_ID], hand: [] });
  });
});

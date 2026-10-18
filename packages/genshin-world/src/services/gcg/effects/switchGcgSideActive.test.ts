import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { switchGcgSideActive } from "#src/services/gcg/effects/switchGcgSideActive";
import { describe, expect, test } from "vitest";

const createCharacterState = (): GcgCharacterState => ({
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

describe(switchGcgSideActive, () => {
  test("should make the character at the index the active one, flagged as switched in, and leave the others unflagged", () => {
    expect.hasAssertions();

    const side = createSideState([createCharacterState(), createCharacterState()]);
    switchGcgSideActive(side, 1);

    expect({
      activeIndex: side.activeIndex,
      flags: side.characters.map(({ isSwitchedIn }) => isSwitchedIn),
    }).toStrictEqual({ activeIndex: 1, flags: [undefined, true] });
  });
});

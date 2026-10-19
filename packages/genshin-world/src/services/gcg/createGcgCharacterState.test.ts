import type { GcgCharacter } from "#src/models/gcg/GcgCharacter";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { Except } from "type-fest";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { describe } from "vitest";

// A character in one duel for a suite to read: a Hydro character of 10 HP and 3 maximum energy, with no skills, equipment,
// Statuses, shield, energy or Frozen status. The overrides replace those values, and a character's own fields are given
// Inside the character they name
export const createGcgCharacterState = (
  overrides: Partial<Except<GcgCharacterState, "character">> & { character?: Partial<GcgCharacter> } = {},
): GcgCharacterState => {
  const { character, ...state } = overrides;
  return {
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
      ...character,
    },
    energy: 0,
    equipments: [],
    hp: 10,
    isFrozen: false,
    shield: 0,
    statuses: [],
    ...state,
  };
};

describe.todo("createGcgCharacterState");

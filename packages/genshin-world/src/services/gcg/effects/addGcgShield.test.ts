import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GCG_SHIELD_LIMIT } from "#src/services/gcg/constants";
import { addGcgShield } from "#src/services/gcg/effects/addGcgShield";
import { describe, expect, test } from "vitest";

const createCharacter = (shield: number): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Geo,
    hp: 10,
    id: 1_605,
    maxEnergy: 3,
    nameTextId: 1,
    skills: [],
    weapon: "",
  },
  energy: 0,
  equipments: [],
  hp: 10,
  isFrozen: false,
  shield,
  statuses: [],
});

describe(addGcgShield, () => {
  test("should add its points to the character's shield", () => {
    expect.hasAssertions();

    const character = createCharacter(0);

    addGcgShield(character, 1);

    expect(character.shield).toBe(1);
  });

  test("should not take the character's shield past the shield limit", () => {
    expect.hasAssertions();

    const character = createCharacter(GCG_SHIELD_LIMIT - 1);

    addGcgShield(character, 3);

    expect(character.shield).toBe(GCG_SHIELD_LIMIT);
  });
});

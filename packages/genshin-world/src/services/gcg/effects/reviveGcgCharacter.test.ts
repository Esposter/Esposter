import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { reviveGcgCharacter } from "#src/services/gcg/effects/reviveGcgCharacter";
import { describe, expect, test } from "vitest";

const MAX_HP = 10;

const createCharacterState = (hp: number): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Hydro,
    hp: MAX_HP,
    id: 1,
    maxEnergy: 3,
    nameTextId: 1,
    skills: [],
    weapon: "",
  },
  energy: 0,
  equipments: [],
  hp,
  isFrozen: false,
  shield: 0,
  statuses: [],
});

describe("revive a character", () => {
  test("a defeated character comes back with the HP given, up to its maximum, and a standing one is left as it was", () => {
    expect.hasAssertions();
    const lowRevival = createCharacterState(0);
    const highRevival = createCharacterState(0);
    const standing = createCharacterState(7);
    reviveGcgCharacter(lowRevival, 1);
    reviveGcgCharacter(highRevival, 20);
    reviveGcgCharacter(standing, 1);
    expect([lowRevival.hp, highRevival.hp, standing.hp]).toStrictEqual([1, MAX_HP, 7]);
  });
});

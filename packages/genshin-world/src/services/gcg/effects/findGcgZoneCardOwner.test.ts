import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { findGcgZoneCardOwner } from "#src/services/gcg/effects/findGcgZoneCardOwner";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { describe, expect, test } from "vitest";

const EQUIPMENT_ID = 301;
const STATUS_ID = 302;
const SUPPORT_ID = 303;

const createCharacterState = (
  equipments: GcgCharacterState["equipments"] = [],
  statuses: GcgCharacterState["statuses"] = [],
): GcgCharacterState => ({
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
  equipments,
  hp: 10,
  isFrozen: false,
  shield: 0,
  statuses,
});

describe(findGcgZoneCardOwner, () => {
  test("should find the character an equipment is attached to", () => {
    expect.hasAssertions();
    const equipment = createGcgZoneCard(EQUIPMENT_ID, {});
    const characters = [createCharacterState(), createCharacterState([equipment])];
    expect(findGcgZoneCardOwner(characters, equipment)).toBe(1);
  });

  test("should find the character a status is attached to", () => {
    expect.hasAssertions();
    const status = createGcgZoneCard(STATUS_ID, {});
    const characters = [createCharacterState([], [status]), createCharacterState()];
    expect(findGcgZoneCardOwner(characters, status)).toBe(0);
  });

  test("should find no owner for a card on the field, which no character holds", () => {
    expect.hasAssertions();
    const support = createGcgZoneCard(SUPPORT_ID, {});
    const characters = [createCharacterState()];
    expect(findGcgZoneCardOwner(characters, support)).toBeUndefined();
  });
});

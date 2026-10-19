import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { findGcgZoneCardOwner } from "#src/services/gcg/effects/findGcgZoneCardOwner";
import { describe, expect, test } from "vitest";

describe(findGcgZoneCardOwner, () => {
  const EQUIPMENT_ID = 301;
  const STATUS_ID = 302;
  const SUPPORT_ID = 303;

  test("should find the character an equipment is attached to", () => {
    expect.hasAssertions();
    const equipment = createGcgZoneCard(EQUIPMENT_ID, {});
    const characters = [createGcgCharacterState(), createGcgCharacterState({ equipments: [equipment] })];

    expect(findGcgZoneCardOwner(characters, equipment)).toBe(1);
  });

  test("should find the character a status is attached to", () => {
    expect.hasAssertions();
    const status = createGcgZoneCard(STATUS_ID, {});
    const characters = [createGcgCharacterState({ equipments: [], statuses: [status] }), createGcgCharacterState()];

    expect(findGcgZoneCardOwner(characters, status)).toBe(0);
  });

  test("should find no owner for a card on the field, which no character holds", () => {
    expect.hasAssertions();
    const support = createGcgZoneCard(SUPPORT_ID, {});
    const characters = [createGcgCharacterState()];

    expect(findGcgZoneCardOwner(characters, support)).toBeUndefined();
  });
});

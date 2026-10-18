import { Element } from "#src/models/Element";
import { GCG_SHIELD_LIMIT } from "#src/services/gcg/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { addGcgShield } from "#src/services/gcg/effects/addGcgShield";
import { describe, expect, test } from "vitest";

describe(addGcgShield, () => {
  test("should add its points to the character's shield", () => {
    expect.hasAssertions();

    const character = createGcgCharacterState({ character: { element: Element.Geo, id: 1_605 }, shield: 0 });

    addGcgShield(character, 1);

    expect(character.shield).toBe(1);
  });

  test("should not take the character's shield past the shield limit", () => {
    expect.hasAssertions();

    const character = createGcgCharacterState({
      character: { element: Element.Geo, id: 1_605 },
      shield: GCG_SHIELD_LIMIT - 1,
    });

    addGcgShield(character, 3);

    expect(character.shield).toBe(GCG_SHIELD_LIMIT);
  });
});

import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { reviveGcgCharacter } from "#src/services/gcg/effects/reviveGcgCharacter";
import { describe, expect, test } from "vitest";

const MAX_HP = 10;

describe(reviveGcgCharacter, () => {
  test("a defeated character comes back with the HP given, up to its maximum, and a standing one is left as it was", () => {
    expect.hasAssertions();
    const lowRevival = createGcgCharacterState({ hp: 0 });
    const highRevival = createGcgCharacterState({ hp: 0 });
    const standing = createGcgCharacterState({ hp: 7 });
    reviveGcgCharacter(lowRevival, 1);
    reviveGcgCharacter(highRevival, 20);
    reviveGcgCharacter(standing, 1);
    expect([lowRevival.hp, highRevival.hp, standing.hp]).toStrictEqual([1, MAX_HP, 7]);
  });
});

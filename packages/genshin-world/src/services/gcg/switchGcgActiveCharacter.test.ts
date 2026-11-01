import { createDuel } from "#src/services/gcg/cards/createDuel.test";
import { createSideState } from "#src/services/gcg/cards/createSideState.test";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { switchGcgActiveCharacter } from "#src/services/gcg/switchGcgActiveCharacter";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(switchGcgActiveCharacter, () => {
  test("should make the character at the index the active one, flagged as switched in, and leave the others unflagged", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createGcgCharacterState(), createGcgCharacterState()]),
      createSideState([]),
    ]);
    switchGcgActiveCharacter(duel, 0, 1);

    const side = takeOne(duel.sides, 0);

    expect({
      activeIndex: side.activeIndex,
      flags: side.characters.map(({ isSwitchedIn }) => isSwitchedIn),
    }).toStrictEqual({ activeIndex: 1, flags: [undefined, true] });
  });
});

import { computeHomeRealmInteractables } from "#src/services/home/computeHomeRealmInteractables";
import { GameTextKey, ENGLISH_GAME_TEXT } from "genshin-text";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(computeHomeRealmInteractables, () => {
  test("the realm holds Tubby to talk to and the pot to leave by", () => {
    expect.hasAssertions();

    expect(computeHomeRealmInteractables(ENGLISH_GAME_TEXT)).toStrictEqual([
      {
        id: "13276",
        kind: InteractionKind.Talk,
        name: ENGLISH_GAME_TEXT[GameTextKey.Tubby],
        position: { x: 6, y: 0, z: 0 },
      },
      {
        id: "220026",
        kind: InteractionKind.Activate,
        name: ENGLISH_GAME_TEXT[GameTextKey.SereniteaPot],
        position: { x: -6, y: 0, z: 0 },
      },
    ]);
  });
});

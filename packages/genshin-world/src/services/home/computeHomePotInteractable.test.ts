import { HOME_POT_GADGET_ID } from "#src/services/home/constants";
import { computeHomePotInteractable } from "#src/services/home/computeHomePotInteractable";
import { InteractionKind } from "genshin-interface";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(computeHomePotInteractable, () => {
  test("a pot set down stands on the ground beneath the point it was set down at", () => {
    expect.hasAssertions();

    expect(computeHomePotInteractable(ENGLISH_GAME_TEXT, { x: 3, z: -4 }, () => 12)).toStrictEqual({
      id: String(HOME_POT_GADGET_ID),
      kind: InteractionKind.Activate,
      name: ENGLISH_GAME_TEXT[GameTextKey.SereniteaPot],
      position: { x: 3, y: 12, z: -4 },
    });
  });
});

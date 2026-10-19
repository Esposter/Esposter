import { computeHomeRealmInteractables } from "#src/services/home/computeHomeRealmInteractables";
import {
  HOME_POT_GADGET_ID,
  HOME_REALM_EXIT_POINT,
  HOME_REALM_GROUND_HEIGHT,
  HOME_REALM_STEWARD_POINT,
  HOME_TUBBY_NPC_ID,
} from "#src/services/home/constants";
import { InteractionKind } from "genshin-interface";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(computeHomeRealmInteractables, () => {
  test("the realm holds Tubby to talk to and the pot to leave by", () => {
    expect.hasAssertions();

    expect(computeHomeRealmInteractables(ENGLISH_GAME_TEXT)).toStrictEqual([
      {
        id: String(HOME_TUBBY_NPC_ID),
        kind: InteractionKind.Talk,
        name: ENGLISH_GAME_TEXT[GameTextKey.Tubby],
        position: { x: HOME_REALM_STEWARD_POINT.x, y: HOME_REALM_GROUND_HEIGHT, z: HOME_REALM_STEWARD_POINT.z },
      },
      {
        id: String(HOME_POT_GADGET_ID),
        kind: InteractionKind.Activate,
        name: ENGLISH_GAME_TEXT[GameTextKey.SereniteaPot],
        position: { x: HOME_REALM_EXIT_POINT.x, y: HOME_REALM_GROUND_HEIGHT, z: HOME_REALM_EXIT_POINT.z },
      },
    ]);
  });
});

import type { Interactable } from "#src/models/interaction/Interactable";
import type { GameText } from "genshin-text";

import { HOME_POT_GADGET_ID, HOME_STAND_IN_POT_POINT } from "#src/services/home/constants";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// The stand-in Serenitea Pot in the open world: an activation the key takes, named by the pot's own text, standing on the
// Ground beneath its point. Provisional until a placed pot takes its place
export const computeHomePotInteractable = (
  gameText: GameText,
  getGroundHeight: (x: number, z: number) => number,
): Interactable => {
  const { x, z } = HOME_STAND_IN_POT_POINT;
  return {
    id: String(HOME_POT_GADGET_ID),
    kind: InteractionKind.Activate,
    name: gameText[GameTextKey.SereniteaPot],
    position: { x, y: getGroundHeight(x, z), z },
  };
};

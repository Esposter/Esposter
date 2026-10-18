import type { Interactable } from "#src/models/interaction/Interactable";
import type { GameText } from "genshin-text";

import { HOME_POT_GADGET_ID } from "#src/services/home/constants";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// The Serenitea Pot set down in the open world: an activation the key takes, named by the pot's own text, standing on the
// Ground beneath the point it was set down at
export const computeHomePotInteractable = (
  gameText: GameText,
  { x, z }: { x: number; z: number },
  getGroundHeight: (x: number, z: number) => number,
): Interactable => ({
  id: String(HOME_POT_GADGET_ID),
  kind: InteractionKind.Activate,
  name: gameText[GameTextKey.SereniteaPot],
  position: { x, y: getGroundHeight(x, z), z },
});

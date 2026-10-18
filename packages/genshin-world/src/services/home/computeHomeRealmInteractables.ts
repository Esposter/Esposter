import type { Interactable } from "#src/models/interaction/Interactable";
import type { GameText } from "genshin-text";

import {
  HOME_POT_GADGET_ID,
  HOME_REALM_EXIT_POINT,
  HOME_REALM_GROUND_HEIGHT,
  HOME_REALM_STEWARD_POINT,
  HOME_TUBBY_NPC_ID,
} from "#src/services/home/constants";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// What the realm's stand-in island holds: Tubby, talked to for the Realm Depot, and the pot, which leaves the realm on the
// Activation key. Each stands on the realm's ground at its point
export const computeHomeRealmInteractables = (gameText: GameText): Interactable[] => [
  {
    id: String(HOME_TUBBY_NPC_ID),
    kind: InteractionKind.Talk,
    name: gameText[GameTextKey.Tubby],
    position: { x: HOME_REALM_STEWARD_POINT.x, y: HOME_REALM_GROUND_HEIGHT, z: HOME_REALM_STEWARD_POINT.z },
  },
  {
    id: String(HOME_POT_GADGET_ID),
    kind: InteractionKind.Activate,
    name: gameText[GameTextKey.SereniteaPot],
    position: { x: HOME_REALM_EXIT_POINT.x, y: HOME_REALM_GROUND_HEIGHT, z: HOME_REALM_EXIT_POINT.z },
  },
];

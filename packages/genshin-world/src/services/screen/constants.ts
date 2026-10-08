import type { ScreenBehaviour } from "#src/models/screen/ScreenBehaviour";

import { InputAction } from "genshin-engine";

// A menu over the world in single-player, as the game's every menu is: the simulation and the clock held, the HUD
// Hidden and the cursor shown, while the music plays on and the world keeps drawing
export const MENU_SCREEN_BEHAVIOUR: Readonly<ScreenBehaviour> = {
  isHeld: true,
  isHudHidden: true,
  isPointerReleased: true,
};
// What closes any screen to the world, beside its own shortcut: Escape and a pad's Start, which open the Paimon menu
// From the world, and a pad's cancel
export const CLOSING_INPUT_ACTIONS: readonly InputAction[] = [InputAction.Cancel, InputAction.OpenPaimonMenu];

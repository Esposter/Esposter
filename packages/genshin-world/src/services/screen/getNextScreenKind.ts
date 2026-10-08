import type { InputAction } from "genshin-engine";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { CLOSING_INPUT_ACTIONS } from "#src/services/screen/constants";
import { InputActionScreenKindMap } from "#src/services/screen/InputActionScreenKindMap";

// What is open once a frame's pressed actions are read, one screen at a time over the world: from the world a shortcut
// Opens its screen, Escape and a pad's Start the Paimon menu among them; over a screen its own shortcut, Escape, Start
// Or a pad's cancel closes it to the world, and every other shortcut waits
export const getNextScreenKind = (screenKind: ScreenKind, pressedActions: ReadonlySet<InputAction>): ScreenKind => {
  for (const action of pressedActions) {
    const actionScreenKind = InputActionScreenKindMap[action];
    if (screenKind === ScreenKind.World && actionScreenKind) return actionScreenKind;
    else if (
      screenKind !== ScreenKind.World &&
      (CLOSING_INPUT_ACTIONS.includes(action) || actionScreenKind === screenKind)
    )
      return ScreenKind.World;
  }

  return screenKind;
};

import type { InputAction } from "genshin-engine";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { InputActionBindingMap } from "genshin-engine";

// The key, by its physical code, the game binds alone to an action first by default, which a HUD piece presses in its
// Place, as the touch controls press theirs
export const getActionKeyCode = (inputAction: InputAction): string => {
  const code = InputActionBindingMap[inputAction].find((chord) => chord.length === 1)?.[0];
  if (code === undefined) throw new InvalidOperationError(Operation.Read, getActionKeyCode.name, inputAction);
  return code;
};

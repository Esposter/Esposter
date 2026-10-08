import type { InputAction } from "genshin-engine";

import { InputActionBindingMap } from "genshin-engine";

// Whether a key, by its physical code, is one the game binds alone to an action by default
export const checkIsActionKey = (inputAction: InputAction, code: string): boolean =>
  InputActionBindingMap[inputAction].some((chord) => chord.length === 1 && chord[0] === code);

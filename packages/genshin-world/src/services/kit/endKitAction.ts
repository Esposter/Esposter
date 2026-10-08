import type { Kit } from "#src/models/kit/Kit";
import type { KitState } from "#src/models/kit/KitState";

// An action ended, by running its course or by the body leaving its states: it stops, and the string's window opens
// From now. Anything but a normal strike starts the string over
export const endKitAction = (kitState: KitState, kit: Kit): void => {
  if (!kitState.action || !kit.normalAttacks.includes(kitState.action)) kitState.comboIndex = 0;
  kitState.action = undefined;
  kitState.actionSeconds = 0;
  kitState.comboSeconds = 0;
};

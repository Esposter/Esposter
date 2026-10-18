import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";

// Whether an action's start gate lets it start, which a state the kit holds can refuse; an action with no gate always starts
export const checkCanStartKitAction = (action: KitAction, context: KitContext): boolean =>
  action.canStart?.(context) !== false;

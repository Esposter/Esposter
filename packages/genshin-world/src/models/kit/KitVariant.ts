import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";

// An action a kit plays in place of its own while its check holds on the step it starts, such as a passive's or a field's
export interface KitVariant {
  action: KitAction;
  checkIsActive: (context: KitContext) => boolean;
}

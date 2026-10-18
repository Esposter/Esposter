import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A normal attack of the character on the field started, as its action's state starts, and whether it is the first
// Strike of its string
export interface KitNormalAttackStartedEvent {
  action: KitAction;
  isFirstStrike: boolean;
  kind: KitEventKind.NormalAttackStarted;
}

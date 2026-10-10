import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A normal attack of the character on the field landed: its first hit's hitmark fell, whether or not it struck anything
export interface KitNormalAttackLandedEvent {
  action: KitAction;
  kind: KitEventKind.NormalAttackLanded;
}

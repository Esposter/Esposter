import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitVariantBehaviour } from "#src/models/kit/KitVariantBehaviour";

// What a character alone gives a hold level of its record's skill: its action's behaviour, and its variant's
export interface KitHoldBehaviour extends KitActionBehaviour {
  variant?: KitVariantBehaviour;
}

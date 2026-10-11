import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitVariant } from "#src/models/kit/KitVariant";

// What a character alone gives an action its record holds as a variant: the check that plays it in place of its kit's
// Own, and the action's behaviour
export interface KitVariantBehaviour extends KitActionBehaviour, Pick<KitVariant, "checkIsActive"> {}

import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

// What a character alone gives the actions a stance of its record plays in place of its kit's, its dash and jump among
// Them, which the kit's own behaviour does not give as it has none
export interface KitStanceBehaviour extends Pick<KitBehaviour, "burst" | "chargedAttack" | "normalAttacks" | "skill"> {
  dash?: KitActionBehaviour;
  jump?: KitActionBehaviour;
}

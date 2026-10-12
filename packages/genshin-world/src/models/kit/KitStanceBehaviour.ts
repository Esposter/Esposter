import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

// What a character alone gives the actions a stance of its record plays in place of its kit's
export type KitStanceBehaviour = Pick<KitBehaviour, "burst" | "chargedAttack" | "normalAttacks" | "skill">;

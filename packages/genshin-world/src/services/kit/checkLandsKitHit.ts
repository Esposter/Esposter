import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

// Whether a hit lands in the context given, for a hit a condition such as a Moonsign's gates; a hit with none always lands
export const checkLandsKitHit = (hit: KitHit, context: KitContext): boolean => hit.landsWhen?.(context) !== false;

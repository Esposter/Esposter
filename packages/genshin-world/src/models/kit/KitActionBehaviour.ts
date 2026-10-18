import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";

// What a character alone gives one action of its record: what its start sets going, and each of its hits' behaviour in
// The order the record holds them
export interface KitActionBehaviour extends Pick<KitAction, "decideLength" | "onStart"> {
  hits?: KitHitBehaviour[];
}

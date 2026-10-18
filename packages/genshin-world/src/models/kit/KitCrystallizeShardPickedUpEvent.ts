import type { Element } from "#src/models/Element";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// The character on the field picked up a Crystallize shard, and so gained the Crystallize shield of the shard's element
export interface KitCrystallizeShardPickedUpEvent {
  characterId: number;
  element: Element;
  kind: KitEventKind.CrystallizeShardPickedUp;
}

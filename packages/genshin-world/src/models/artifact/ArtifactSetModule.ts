import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitEventContext } from "#src/models/kit/KitEventContext";

// What a set's bonus that waits on combat does once its wearer wears enough of the set: the events of combat it answers,
// Each read as its wearer's own kit reads it
export interface ArtifactSetModule {
  onKitEvent: (event: KitEvent, context: KitEventContext) => void;
}

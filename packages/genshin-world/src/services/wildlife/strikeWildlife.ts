import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Wildlife } from "#src/models/wildlife/Wildlife";

import { WildlifeState } from "#src/models/wildlife/WildlifeState";
import { WildlifeKindDropMap } from "#src/services/wildlife/WildlifeKindDropMap";

// Strikes an animal down where it stands, giving its drop once: the animal not yet struck falls and its kind's drop is
// Returned, and one already struck gives nothing
export const strikeWildlife = (wildlife: Wildlife): DroppedItem | undefined => {
  if (wildlife.state === WildlifeState.Struck) return undefined;
  wildlife.state = WildlifeState.Struck;
  wildlife.stateSeconds = 0;
  const drop = WildlifeKindDropMap[wildlife.kind];
  return drop && { ...drop };
};

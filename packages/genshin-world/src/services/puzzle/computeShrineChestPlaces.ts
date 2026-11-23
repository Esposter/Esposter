import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { ShrineMarker } from "#src/models/puzzle/ShrineMarker";

import { SHRINE_CHEST_KIND } from "#src/services/puzzle/constants";

// The chest each open Shrine of Depths holds, at its point. A shut shrine holds no chest the world offers until it
// Opens
export const computeShrineChestPlaces = (shrineMarkers: readonly ShrineMarker[]): ChestPlace[] =>
  shrineMarkers
    .filter(({ shrine }) => shrine.isOpen)
    .map(({ id, position }) => ({ id: `shrine-chest-${id}`, kind: SHRINE_CHEST_KIND, position }));

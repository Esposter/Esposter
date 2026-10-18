import type { PuzzlePlace } from "#src/models/puzzle/PuzzlePlace";
import type { GroundPoint } from "genshin-engine";

import { PuzzleKind } from "#src/models/puzzle/PuzzleKind";
import { findNearestPlace } from "#src/services/gadget/findNearestPlace";

// The Seelie a Seelie detector points to: the nearest Seelie of the region the player stands in that is not settled yet,
// Measured from the player's position on the ground. None when every Seelie there is settled
export const findSeelieDetectorTarget = (
  regionPuzzlePlaces: readonly PuzzlePlace[],
  settledSeelieIds: ReadonlySet<string>,
  position: GroundPoint,
): PuzzlePlace | undefined =>
  findNearestPlace(
    regionPuzzlePlaces.filter(({ id, kind }) => kind === PuzzleKind.Seelie && !settledSeelieIds.has(id)),
    position,
  );

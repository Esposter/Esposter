import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { GadgetRow } from "#src/models/gadget/GadgetRow";
import type { GroundPoint } from "genshin-engine";

import { GadgetKind } from "#src/models/gadget/GadgetKind";
import { findTreasureCompassTarget } from "#src/services/gadget/findTreasureCompassTarget";

// The chest a used detector points to. A Treasure Compass names its city's region, so it points to the nearest unopened
// Box of that region. A detector that names no region is the Seelie detector, which points to nothing until its region's
// Puzzle places are read, and a gadget of any other kind points to no box
export const computeDetectorTarget = (
  gadget: GadgetRow,
  regionChestPlaces: readonly ChestPlace[],
  openedChestIds: ReadonlySet<string>,
  position: GroundPoint,
): ChestPlace | undefined =>
  // oxlint-disable-next-line selector-ban/no-restricted-syntax -- a region id from the game data, never typed
  gadget.kind === GadgetKind.Detector && gadget.region !== ""
    ? findTreasureCompassTarget(regionChestPlaces, openedChestIds, position)
    : undefined;

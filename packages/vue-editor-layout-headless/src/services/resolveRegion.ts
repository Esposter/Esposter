import type { ReaderState } from "#src/models/ReaderState";
import type { Region } from "#src/models/Region";
import type { ResolvedPanel } from "#src/models/ResolvedPanel";
import type { ResolvedRegion } from "#src/models/ResolvedRegion";
import type { SizeClass } from "#src/models/SizeClass";

import { getActivePanelId } from "#src/services/getActivePanelId";
import { getRegionSize } from "#src/services/getRegionSize";
import { presentRegion } from "#src/services/presentRegion";

// A region that holds present panels, drawn for a size class and the reader's state
export const resolveRegion = (
  region: Region,
  panels: ResolvedPanel[],
  sizeClass: SizeClass,
  readerState: ReaderState,
): ResolvedRegion => {
  const placement = presentRegion(region, sizeClass, readerState);
  const activePanelId = getActivePanelId(region, panels, readerState);
  const size = getRegionSize(region, readerState);
  return {
    activePanelId,
    edge: placement.edge,
    id: region.id,
    isOpen: placement.isOpen,
    maximumSize: region.maximumSize,
    minimumSize: region.minimumSize,
    panels,
    presentation: placement.presentation,
    size,
  };
};

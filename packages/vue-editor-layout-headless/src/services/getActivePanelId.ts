import type { ReaderState } from "#src/models/ReaderState";
import type { Region } from "#src/models/Region";
import type { ResolvedPanel } from "#src/models/ResolvedPanel";

import { takeOne } from "@esposter/shared";

// The panel a region shows: the reader's choice while that panel is present, and the region's first present panel otherwise.
// The caller passes a region's present panels, which are never none
export const getActivePanelId = (region: Region, panels: ResolvedPanel[], readerState: ReaderState): string => {
  const storedPanelId = readerState.regionActivePanelIdMap[region.id];
  const storedPanel = panels.find((panel) => panel.id === storedPanelId);
  return storedPanel ? storedPanel.id : takeOne(panels, 0).id;
};

import type { Layout } from "#src/models/Layout";
import type { ReaderState } from "#src/models/ReaderState";

import { clampRegionSize } from "#src/services/clampRegionSize";
import { fitRegionMap } from "#src/services/fitRegionMap";

// A stored state fitted to a layout. Every entry naming a region or panel the layout no longer has is dropped, every stored size is held
// Between its region's limits, and a stored active panel is kept only while it is a panel of its own region
export const fitReaderState = (layout: Layout, readerState: ReaderState): ReaderState => {
  const regionActivePanelIdMap = fitRegionMap(layout, readerState.regionActivePanelIdMap, (region, panelId) =>
    layout.panels.some((panel) => panel.id === panelId && panel.regionId === region.id) ? panelId : undefined,
  );
  const regionOpenMap = fitRegionMap(layout, readerState.regionOpenMap, (_region, isOpen) => isOpen);
  const regionSizeMap = fitRegionMap(layout, readerState.regionSizeMap, clampRegionSize);
  return { regionActivePanelIdMap, regionOpenMap, regionSizeMap };
};

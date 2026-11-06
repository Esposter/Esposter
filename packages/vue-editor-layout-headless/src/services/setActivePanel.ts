import type { ReaderState } from "#src/models/ReaderState";

// The state with a tabbed region's active panel set. The given state is left as it was
export const setActivePanel = (readerState: ReaderState, regionId: string, panelId: string): ReaderState => ({
  ...readerState,
  regionActivePanelIdMap: { ...readerState.regionActivePanelIdMap, [regionId]: panelId },
});

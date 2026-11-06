import type { ReaderState } from "#src/models/ReaderState";

// The state with a region's open state turned over. The caller passes whether the region is open now, as it is resolved, since
// A region the reader has never toggled is open or closed by its presentation
export const toggleRegion = (readerState: ReaderState, regionId: string, isCurrentlyOpen: boolean): ReaderState => ({
  ...readerState,
  regionOpenMap: { ...readerState.regionOpenMap, [regionId]: !isCurrentlyOpen },
});

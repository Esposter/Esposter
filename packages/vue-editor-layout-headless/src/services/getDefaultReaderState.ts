import type { ReaderState } from "#src/models/ReaderState";

// The state of a reader who has changed nothing: every region at its default size, open as its presentation opens it, and showing its first panel
export const getDefaultReaderState = (): ReaderState => ({
  regionActivePanelIdMap: {},
  regionOpenMap: {},
  regionSizeMap: {},
});

import type { ReaderState } from "#src/models/ReaderState";
import type { Region } from "#src/models/Region";

import { RegionOpening } from "#src/models/RegionOpening";
import { RegionPresentation } from "#src/models/RegionPresentation";

// Whether a region that holds a panel is open for its presentation. A hidden region is never open, and a sheet is open only
// Once the reader opens it. A region that opens with its content is open, and one that opens on demand is open as the reader
// Left it, or open when docked
export const checkIsRegionOpen = (
  region: Region,
  presentation: RegionPresentation,
  readerState: ReaderState,
): boolean => {
  if (presentation === RegionPresentation.Hidden) return false;
  const storedIsOpen = readerState.regionOpenMap[region.id];
  if (presentation === RegionPresentation.Sheet) return storedIsOpen ?? false;
  if (region.opening === RegionOpening.WithContent) return true;
  return storedIsOpen ?? presentation === RegionPresentation.Docked;
};

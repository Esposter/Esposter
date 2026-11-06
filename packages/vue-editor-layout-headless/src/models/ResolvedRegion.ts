import type { RegionEdge } from "#src/models/RegionEdge";
import type { RegionPresentation } from "#src/models/RegionPresentation";
import type { ResolvedPanel } from "#src/models/ResolvedPanel";

// A region the layout draws for a context: its edge and presentation, whether it is open, its size and the panels it holds
export interface ResolvedRegion {
  // The panel the region shows: the reader's choice while that panel is present, the first present panel otherwise
  activePanelId: string;
  edge: RegionEdge;
  id: string;
  isOpen: boolean;
  panels: ResolvedPanel[];
  presentation: RegionPresentation;
  size: number;
}

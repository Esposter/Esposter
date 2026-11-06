import { DEFAULT_SIDE_PANE_WIDTH, MAX_SIDE_PANE_WIDTH, MIN_SIDE_PANE_WIDTH } from "@/services/ui/constants";
import { RegionPresentation, SizeClass } from "vue-editor-layout-headless";

// A bar is drawn in the flow at every size class, since a window too narrow for a column still has the row for it
export const DOCKED_REGION_PRESENTATION_MAP = {
  [SizeClass.Compact]: RegionPresentation.Docked,
  [SizeClass.Expanded]: RegionPresentation.Docked,
  [SizeClass.Medium]: RegionPresentation.Docked,
} as const satisfies Record<SizeClass, RegionPresentation>;
// A side region is a column beside the canvas while the window has room for it, and a sheet from its edge otherwise. The medium
// Class is the one the page's drawers are sheets in, where two columns would leave the canvas too little width to edit in
export const SIDE_REGION_PRESENTATION_MAP = {
  [SizeClass.Compact]: RegionPresentation.Sheet,
  [SizeClass.Expanded]: RegionPresentation.Docked,
  [SizeClass.Medium]: RegionPresentation.Sheet,
} as const satisfies Record<SizeClass, RegionPresentation>;
// The size a side region opens at, and is held between
export const SIDE_REGION_SIZE = {
  defaultSize: DEFAULT_SIDE_PANE_WIDTH,
  maximumSize: MAX_SIDE_PANE_WIDTH,
  minimumSize: MIN_SIDE_PANE_WIDTH,
};

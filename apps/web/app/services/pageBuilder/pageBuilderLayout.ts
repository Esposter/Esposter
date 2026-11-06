import type { Panel, Region } from "vue-editor-layout-headless";

import { DEFAULT_SIDE_PANE_WIDTH } from "@/services/pageBuilder/constants";
import { MAX_SIDE_PANE_WIDTH, MIN_SIDE_PANE_WIDTH } from "@/services/ui/constants";
import { RegionEdge, RegionOpening, RegionPresentation, SizeClass } from "vue-editor-layout-headless";

// The parts the page builder's layout is built from: a bar over the page, the blocks at the start, the settings at the end and
// The canvas in the rest. The webpage's layout adds its settings tabs to these
export const PAGE_BUILDER_CANVAS_ID = "canvas";
export const PAGE_BUILDER_REGION_ID_MAP = { Bar: "bar", Blocks: "blocks", Inspector: "inspector" } as const;
export const PAGE_BUILDER_PANEL_ID_MAP = {
  Bar: "bar",
  Blocks: "blocks",
  Content: "content",
  Layers: "layers",
  Page: "page",
  Style: "style",
  Theme: "theme",
} as const;
// The content key each panel draws in the editor's registry, so the layout check reads each one the editor must register
export const PAGE_BUILDER_CONTENT_KEY_MAP = {
  Bar: "bar",
  Blocks: "blocks",
  Content: "content",
  Layers: "layers",
  Style: "style",
  Theme: "theme",
} as const;
// The selection kinds a page builder layout names: a node, and nothing, which the layout's context answers as the empty kind
export const PAGE_BUILDER_SELECTION_KIND_MAP = { Node: "node", Nothing: "" } as const;
// The name each side region is announced by, and the sheet it opens as is titled
export const PAGE_BUILDER_REGION_NAME_MAP = {
  [PAGE_BUILDER_REGION_ID_MAP.Bar]: "Page bar",
  [PAGE_BUILDER_REGION_ID_MAP.Blocks]: "Blocks",
  [PAGE_BUILDER_REGION_ID_MAP.Inspector]: "Settings",
} as const;
// The bar holds one row of controls, so it is held at that one size and its handle has nothing to move
const PAGE_BAR_SIZE = 48;
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
// A side region is a column beside the canvas while the window has room for it, and a sheet from its edge otherwise. The medium
// Class is the one the page's drawers are sheets in, where two columns would leave the canvas too little width to edit in
export const PAGE_BUILDER_REGIONS: Region[] = [
  {
    defaultSize: PAGE_BAR_SIZE,
    edge: RegionEdge.Top,
    id: PAGE_BUILDER_REGION_ID_MAP.Bar,
    maximumSize: PAGE_BAR_SIZE,
    minimumSize: PAGE_BAR_SIZE,
    opening: RegionOpening.WithContent,
    sizeClassEdgeMap: {},
    sizeClassPresentationMap: {
      [SizeClass.Compact]: RegionPresentation.Docked,
      [SizeClass.Expanded]: RegionPresentation.Docked,
      [SizeClass.Medium]: RegionPresentation.Docked,
    },
  },
  {
    ...SIDE_REGION_SIZE,
    edge: RegionEdge.Start,
    id: PAGE_BUILDER_REGION_ID_MAP.Blocks,
    opening: RegionOpening.OnDemand,
    sizeClassEdgeMap: {},
    sizeClassPresentationMap: SIDE_REGION_PRESENTATION_MAP,
  },
  {
    ...SIDE_REGION_SIZE,
    edge: RegionEdge.End,
    id: PAGE_BUILDER_REGION_ID_MAP.Inspector,
    opening: RegionOpening.WithContent,
    sizeClassEdgeMap: {},
    sizeClassPresentationMap: SIDE_REGION_PRESENTATION_MAP,
  },
];
// The panels every page builder layout holds: the bar, the palette and the layers tree, each shown whatever the selection
export const PAGE_BUILDER_BASE_PANELS: Panel[] = [
  {
    condition: {},
    id: PAGE_BUILDER_PANEL_ID_MAP.Bar,
    regionId: PAGE_BUILDER_REGION_ID_MAP.Bar,
    selectionKindContentKeyMap: {},
    wildcardContentKey: PAGE_BUILDER_CONTENT_KEY_MAP.Bar,
  },
  {
    condition: {},
    id: PAGE_BUILDER_PANEL_ID_MAP.Blocks,
    regionId: PAGE_BUILDER_REGION_ID_MAP.Blocks,
    selectionKindContentKeyMap: {},
    wildcardContentKey: PAGE_BUILDER_CONTENT_KEY_MAP.Blocks,
  },
  {
    condition: {},
    id: PAGE_BUILDER_PANEL_ID_MAP.Layers,
    regionId: PAGE_BUILDER_REGION_ID_MAP.Blocks,
    selectionKindContentKeyMap: {},
    wildcardContentKey: PAGE_BUILDER_CONTENT_KEY_MAP.Layers,
  },
];
// The tab titles of the panels the page builder's layouts share, which a layout's own panels add to
export const PAGE_BUILDER_PANEL_NAME_MAP = {
  [PAGE_BUILDER_PANEL_ID_MAP.Blocks]: "Blocks",
  [PAGE_BUILDER_PANEL_ID_MAP.Content]: "Content",
  [PAGE_BUILDER_PANEL_ID_MAP.Layers]: "Layers",
  [PAGE_BUILDER_PANEL_ID_MAP.Style]: "Style",
} as const;

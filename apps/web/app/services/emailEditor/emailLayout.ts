import type { Layout } from "vue-editor-layout-headless";

import { EmailContentKey } from "@/models/emailEditor/EmailContentKey";
import { EmailSelectionKind } from "@/models/emailEditor/EmailSelectionKind";
import { EmailView } from "@/models/pageBuilder/EmailView";
import { DEFAULT_SIDE_PANE_WIDTH } from "@/services/pageBuilder/constants";
import { PAGE_BUILDER_PANEL_ID_MAP, PAGE_BUILDER_PANEL_NAME_MAP } from "@/services/pageBuilder/pageBuilderLayout";
import { MAX_SIDE_PANE_WIDTH, MIN_SIDE_PANE_WIDTH } from "@/services/ui/constants";
import { RegionEdge, RegionOpening, RegionPresentation, SizeClass } from "vue-editor-layout-headless";

// The bar is one row where its controls fit, and a reader drags it taller where they wrap
const BAR_SIZE = { defaultSize: 56, maximumSize: 160, minimumSize: 56 };
const SIDE_REGION_SIZE = {
  defaultSize: DEFAULT_SIDE_PANE_WIDTH,
  maximumSize: MAX_SIDE_PANE_WIDTH,
  minimumSize: MIN_SIDE_PANE_WIDTH,
};
// A side region is docked beside the canvas on a wide window, and a sheet from its edge on a narrower one, as the page's drawers are
const SIDE_REGION_PRESENTATION_MAP = {
  [SizeClass.Compact]: RegionPresentation.Sheet,
  [SizeClass.Expanded]: RegionPresentation.Docked,
  [SizeClass.Medium]: RegionPresentation.Sheet,
};
// The blocks region holds the layers tree as its structure tab, so a text edit's end shows that tab before it returns focus to
// The tree. The ids are named here, so the editor's reveal and the layout name the same panel
export const EMAIL_BLOCKS_REGION_ID = "blocks";
export const EMAIL_STRUCTURE_PANEL_ID = "structure";
// The email's arrangement: the bar over the canvas, the blocks at the start and the inspector at the end. The blocks and the
// Inspector are drawn in Design alone, so Preview shows the compiled message with nothing editing beside it
export const emailLayout: Layout = {
  canvasId: "canvas",
  panels: [
    {
      condition: {},
      id: "bar",
      regionId: "bar",
      selectionKindContentKeyMap: {},
      wildcardContentKey: EmailContentKey.Bar,
    },
    {
      condition: { modes: [EmailView.Design] },
      id: "blocks",
      regionId: EMAIL_BLOCKS_REGION_ID,
      selectionKindContentKeyMap: {},
      wildcardContentKey: EmailContentKey.Palette,
    },
    {
      condition: { modes: [EmailView.Design] },
      id: EMAIL_STRUCTURE_PANEL_ID,
      regionId: EMAIL_BLOCKS_REGION_ID,
      selectionKindContentKeyMap: {},
      wildcardContentKey: EmailContentKey.Layers,
    },
    {
      condition: { modes: [EmailView.Design], selectionKinds: [EmailSelectionKind.None] },
      id: "settings",
      regionId: "inspector",
      selectionKindContentKeyMap: {},
      wildcardContentKey: EmailContentKey.Settings,
    },
    {
      condition: { modes: [EmailView.Design], selectionKinds: [EmailSelectionKind.Node] },
      id: "content",
      regionId: "inspector",
      selectionKindContentKeyMap: {},
      wildcardContentKey: EmailContentKey.Content,
    },
    {
      condition: { modes: [EmailView.Design], selectionKinds: [EmailSelectionKind.Node] },
      id: "style",
      regionId: "inspector",
      selectionKindContentKeyMap: {},
      wildcardContentKey: EmailContentKey.Style,
    },
  ],
  regions: [
    {
      ...BAR_SIZE,
      edge: RegionEdge.Top,
      id: "bar",
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
      id: EMAIL_BLOCKS_REGION_ID,
      opening: RegionOpening.OnDemand,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: SIDE_REGION_PRESENTATION_MAP,
    },
    {
      ...SIDE_REGION_SIZE,
      edge: RegionEdge.End,
      id: "inspector",
      opening: RegionOpening.WithContent,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: SIDE_REGION_PRESENTATION_MAP,
    },
  ],
};
// The name each region is announced by, and each panel's tab is labelled by. A panel with no tab of its own is named too
export const emailRegionNameMap: Record<string, string> = {
  bar: "Email bar",
  [EMAIL_BLOCKS_REGION_ID]: "Blocks",
  inspector: "Inspector",
};
export const emailPanelNameMap: Record<string, string> = {
  bar: "Email bar",
  blocks: "Blocks",
  content: PAGE_BUILDER_PANEL_NAME_MAP[PAGE_BUILDER_PANEL_ID_MAP.Content],
  [EMAIL_STRUCTURE_PANEL_ID]: "Structure",
  settings: "Email settings",
  style: PAGE_BUILDER_PANEL_NAME_MAP[PAGE_BUILDER_PANEL_ID_MAP.Style],
};

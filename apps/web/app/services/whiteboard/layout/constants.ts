import type { Layout } from "vue-editor-layout-headless";

import { PositionedElementType } from "vue-block-editor-headless";
import { RegionEdge, RegionOpening, RegionPresentation, SizeClass } from "vue-editor-layout-headless";

// The content each panel of the whiteboard's layout shows, keyed by the names the registry maps to a component
export const WHITEBOARD_CONTENT_KEY = {
  Arrow: "arrow",
  Element: "element",
  SeveralElements: "severalElements",
  Tools: "tools",
  View: "view",
} as const;
// The regions of the whiteboard: the toolbar, the properties panel the selection opens and the view's zoom and history controls
export const WHITEBOARD_REGION_ID = { Properties: "properties", Tools: "tools", View: "view" } as const;
// The selection kind of a selection of more than one element. A single element's kind is its type
export const WHITEBOARD_SEVERAL_SELECTION_KIND = "several";
export const WHITEBOARD_SELECTION_KINDS: string[] = [
  ...Object.values(PositionedElementType),
  WHITEBOARD_SEVERAL_SELECTION_KIND,
];
// The name each side region's landmark, or its sheet, is announced by
export const WHITEBOARD_REGION_NAME_MAP: Record<string, string> = {
  [WHITEBOARD_REGION_ID.Properties]: "Properties",
  [WHITEBOARD_REGION_ID.Tools]: "Tools",
  [WHITEBOARD_REGION_ID.View]: "View",
};
// The regions that float over the canvas at every size class, the view among them
const WHITEBOARD_OVERLAY_PRESENTATION_MAP = {
  [SizeClass.Compact]: RegionPresentation.Overlay,
  [SizeClass.Expanded]: RegionPresentation.Overlay,
  [SizeClass.Medium]: RegionPresentation.Overlay,
};

// The layout the shell draws the whiteboard by: the tools float over the top of the canvas and dock at the bottom on a compact window, the
// Properties panel opens at the start edge for a selection and is a sheet on a compact window, and the view floats at the bottom
export const WHITEBOARD_LAYOUT: Layout = {
  canvasId: "canvas",
  panels: [
    {
      condition: {},
      id: WHITEBOARD_REGION_ID.Tools,
      regionId: WHITEBOARD_REGION_ID.Tools,
      selectionKindContentKeyMap: {},
      wildcardContentKey: WHITEBOARD_CONTENT_KEY.Tools,
    },
    {
      condition: { selectionKinds: WHITEBOARD_SELECTION_KINDS },
      id: WHITEBOARD_REGION_ID.Properties,
      regionId: WHITEBOARD_REGION_ID.Properties,
      selectionKindContentKeyMap: {
        [PositionedElementType.Arrow]: WHITEBOARD_CONTENT_KEY.Arrow,
        [WHITEBOARD_SEVERAL_SELECTION_KIND]: WHITEBOARD_CONTENT_KEY.SeveralElements,
      },
      wildcardContentKey: WHITEBOARD_CONTENT_KEY.Element,
    },
    {
      condition: {},
      id: WHITEBOARD_REGION_ID.View,
      regionId: WHITEBOARD_REGION_ID.View,
      selectionKindContentKeyMap: {},
      wildcardContentKey: WHITEBOARD_CONTENT_KEY.View,
    },
  ],
  regions: [
    {
      defaultSize: 56,
      edge: RegionEdge.Top,
      id: WHITEBOARD_REGION_ID.Tools,
      maximumSize: 120,
      minimumSize: 40,
      opening: RegionOpening.WithContent,
      sizeClassEdgeMap: { [SizeClass.Compact]: RegionEdge.Bottom },
      sizeClassPresentationMap: {
        [SizeClass.Compact]: RegionPresentation.Docked,
        [SizeClass.Expanded]: RegionPresentation.Overlay,
        [SizeClass.Medium]: RegionPresentation.Overlay,
      },
    },
    {
      defaultSize: 240,
      edge: RegionEdge.Start,
      id: WHITEBOARD_REGION_ID.Properties,
      maximumSize: 400,
      minimumSize: 160,
      opening: RegionOpening.WithContent,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: {
        [SizeClass.Compact]: RegionPresentation.Sheet,
        [SizeClass.Expanded]: RegionPresentation.Overlay,
        [SizeClass.Medium]: RegionPresentation.Overlay,
      },
    },
    {
      defaultSize: 56,
      edge: RegionEdge.Bottom,
      id: WHITEBOARD_REGION_ID.View,
      maximumSize: 120,
      minimumSize: 40,
      opening: RegionOpening.WithContent,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: WHITEBOARD_OVERLAY_PRESENTATION_MAP,
    },
  ],
};

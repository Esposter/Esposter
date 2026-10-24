import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { PageBuilderPaletteCategory } from "@/models/pageBuilder/PageBuilderPaletteCategory";

import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";

// The most edits one open resource's undo history keeps, the oldest dropping first
export const MAX_PAGE_BUILDER_HISTORY_SIZE = 100;
// The palette group every page builder command is listed under
export const PAGE_BUILDER_COMMAND_GROUP = "Page builder";
// The announcement for a block that a paste or insert cannot place where it was aimed
export const CANNOT_GO_HERE_MESSAGE = "This block cannot go here";
// The title each webpage node type is shown by
export const WEBPAGE_NODE_TYPE_TITLE_MAP: Readonly<Record<WebpageNodeType, string>> = Object.freeze({
  [WebpageNodeType.Button]: "Button",
  [WebpageNodeType.Column]: "Column",
  [WebpageNodeType.Columns]: "Columns",
  [WebpageNodeType.Countdown]: "Countdown",
  [WebpageNodeType.CustomHtml]: "Custom HTML",
  [WebpageNodeType.Image]: "Image",
  [WebpageNodeType.Section]: "Section",
  [WebpageNodeType.SurveyInvite]: "Survey invite",
  [WebpageNodeType.Tab]: "Tab",
  [WebpageNodeType.Tabs]: "Tabs",
  [WebpageNodeType.Text]: "Text",
  [WebpageNodeType.Tooltip]: "Tooltip",
  [WebpageNodeType.TypedText]: "Typed text",
  [WebpageNodeType.Video]: "Video",
});
// The thickness of the line a drop indicator draws between two children
export const LINE_THICKNESS = 2;
// The distance a palette press must travel before it is a drag rather than a click on the block's button
export const DRAG_THRESHOLD = 4;
// The palette's categories in the order shown, each with the node types it lists in the order shown. Column and Tab are not
// Listed, since only Columns and Tabs hold them
export const WEBPAGE_PALETTE_CATEGORIES: readonly PageBuilderPaletteCategory<WebpageNode>[] = Object.freeze([
  Object.freeze({ category: "Layout", types: Object.freeze([WebpageNodeType.Section, WebpageNodeType.Columns]) }),
  Object.freeze({
    category: "Content",
    types: Object.freeze([
      WebpageNodeType.Text,
      WebpageNodeType.Button,
      WebpageNodeType.Image,
      WebpageNodeType.Video,
      WebpageNodeType.CustomHtml,
    ]),
  }),
  Object.freeze({
    category: "Extra",
    types: Object.freeze([
      WebpageNodeType.Countdown,
      WebpageNodeType.Tabs,
      WebpageNodeType.Tooltip,
      WebpageNodeType.TypedText,
    ]),
  }),
  Object.freeze({ category: "Survey", types: Object.freeze([WebpageNodeType.SurveyInvite]) }),
]);
// The pointer and history interaction of the root, whose props are edited when no node is selected
export const ROOT_POINTER = "/root";
export const ROOT_INTERACTION_ID = "content:root";
// The bounds and starting width of the page builder's side panes, in pixels
export const MIN_SIDE_PANE_WIDTH = 200;
export const MAX_SIDE_PANE_WIDTH = 480;
export const DEFAULT_SIDE_PANE_WIDTH = 260;
// The content panel's title, which is also its value in the node settings tabs
export const CONTENT_PANEL = "Content";
// The theme panel's title, which is also its value in the node settings tabs
export const THEME_PANEL = "Theme";
// The colour a new theme colour starts as, until the colour field changes it
export const DEFAULT_THEME_COLOR = "#000000";
// The style panel's title, which is also its value in the node settings tabs
export const STYLE_PANEL = "Style";
// The name each breakpoint's override is shown under, where the base is the desktop
export const STYLE_BREAKPOINT_TITLE_MAP = {
  [StyleBreakpoint.Base]: "Desktop",
  [StyleBreakpoint.Mobile]: "Mobile",
  [StyleBreakpoint.Tablet]: "Tablet",
} satisfies Record<StyleBreakpoint, string>;
// The breakpoint each device's edits write their overrides to
export const DEVICE_BREAKPOINT_MAP = {
  [PageBuilderDevice.Desktop]: StyleBreakpoint.Base,
  [PageBuilderDevice.Mobile]: StyleBreakpoint.Mobile,
  [PageBuilderDevice.Tablet]: StyleBreakpoint.Tablet,
} satisfies Record<PageBuilderDevice, StyleBreakpoint>;
// The properties the style panel draws as a colour field, which offers the page's theme colours as swatches
export const STYLE_COLOR_PROPERTIES: readonly StyleProperty[] = ["color", "background-color", "border-color"];
// The properties the style panel draws as a choice of a few values, each value a segment of a toggle group
export const STYLE_CHOICES: Partial<Record<StyleProperty, string[]>> = {
  "align-items": ["flex-start", "center", "flex-end", "stretch"],
  "flex-direction": ["row", "column"],
  "justify-content": ["flex-start", "center", "flex-end", "space-between"],
  "text-align": ["left", "center", "right", "justify"],
};
// The properties the style panel draws as a length, a number with a unit its select offers
export const STYLE_LENGTH_PROPERTIES: readonly StyleProperty[] = [
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "width",
  "height",
  "max-width",
  "top",
  "right",
  "bottom",
  "left",
  "gap",
  "font-size",
  "letter-spacing",
  "border-width",
  "border-radius",
];
// The units a length's select offers, and the one a number with none is shown in
export const STYLE_LENGTH_UNITS = ["px", "rem", "em", "%", "vw", "vh"];
// A border is never a share of its box, so its width leaves the percentage out of its unit select and its text
export const STYLE_BORDER_WIDTH_UNITS = STYLE_LENGTH_UNITS.filter((lengthUnit) => lengthUnit !== "%");
export const DEFAULT_LENGTH_UNIT = "px";
// The sectors the style panel groups its properties in, in the order it draws them
export const STYLE_SECTORS = [
  { properties: ["display", "flex-direction", "justify-content", "align-items", "gap"], title: "Layout" },
  {
    properties: [
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
    ],
    title: "Spacing",
  },
  { properties: ["width", "height", "max-width"], title: "Size" },
  { properties: ["position", "top", "right", "bottom", "left"], title: "Position" },
  {
    properties: [
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "text-align",
      "text-decoration",
      "color",
    ],
    title: "Typography",
  },
  { properties: ["background-color", "background-image"], title: "Background" },
  { properties: ["border-width", "border-style", "border-color", "border-radius"], title: "Border" },
  { properties: ["opacity", "box-shadow"], title: "Effects" },
] satisfies { properties: StyleProperty[]; title: string }[];

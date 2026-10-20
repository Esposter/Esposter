import type { WebpagePaletteCategory } from "@/models/pageBuilder/WebpagePaletteCategory";

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
// The palette's categories in the order shown, each with the node types it lists in the order shown. Column and Tab are not
// Listed, since only Columns and Tabs hold them
export const WEBPAGE_PALETTE_CATEGORIES: readonly WebpagePaletteCategory[] = [
  { category: "Layout", types: [WebpageNodeType.Section, WebpageNodeType.Columns] },
  {
    category: "Content",
    types: [
      WebpageNodeType.Text,
      WebpageNodeType.Button,
      WebpageNodeType.Image,
      WebpageNodeType.Video,
      WebpageNodeType.CustomHtml,
    ],
  },
  {
    category: "Extra",
    types: [WebpageNodeType.Countdown, WebpageNodeType.Tabs, WebpageNodeType.Tooltip, WebpageNodeType.TypedText],
  },
  { category: "Survey", types: [WebpageNodeType.SurveyInvite] },
];
// The pointer and history interaction of the root, whose props are edited when no node is selected
export const ROOT_POINTER = "/root";
export const ROOT_INTERACTION_ID = "content:root";
// The bounds and starting width of the page builder's side panes, in pixels
export const MIN_SIDE_PANE_WIDTH = 200;
export const MAX_SIDE_PANE_WIDTH = 480;
export const DEFAULT_SIDE_PANE_WIDTH = 260;
// The content panel's title, which is also its value in the node settings tabs
export const CONTENT_PANEL = "Content";

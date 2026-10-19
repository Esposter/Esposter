import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";

// The most edits one open resource's undo history keeps, the oldest dropping first
export const MAX_PAGE_BUILDER_HISTORY_SIZE = 100;
// The palette group every page builder command is listed under
export const PAGE_BUILDER_COMMAND_GROUP = "Page builder";
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
// The palette's categories, each with the node types it lists in the order shown. Column and Tab are not listed, since
// Only Columns and Tabs hold them
export const WEBPAGE_PALETTE_CATEGORY_MAP: Readonly<Record<string, readonly WebpageNodeType[]>> = Object.freeze({
  Layout: [WebpageNodeType.Section, WebpageNodeType.Columns],
  Content: [
    WebpageNodeType.Text,
    WebpageNodeType.Button,
    WebpageNodeType.Image,
    WebpageNodeType.Video,
    WebpageNodeType.CustomHtml,
  ],
  Extra: [WebpageNodeType.Countdown, WebpageNodeType.Tabs, WebpageNodeType.Tooltip, WebpageNodeType.TypedText],
  Survey: [WebpageNodeType.SurveyInvite],
});

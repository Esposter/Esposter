import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";

// The most edits one open resource's undo history keeps, the oldest dropping first
export const MAX_PAGE_BUILDER_HISTORY_SIZE = 100;
// The palette group every page builder command is listed under
export const PAGE_BUILDER_COMMAND_GROUP = "Page builder";
// A node's label in the layers tree, Move to's paths and the move announcements
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

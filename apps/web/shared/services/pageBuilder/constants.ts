import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";

// The most nodes a webpage may hold, counted across every slot, so a document cannot grow past what a render walks
export const MAX_WEBPAGE_NODES = 2000;

// The button colour of a survey invite. The GrapesJS editor keeps its own copy until the cutover removes that editor, and
// The shared folder cannot import the app's constant, so the value is held here
export const SURVEY_INVITE_BUTTON_COLOR = "#F63A4D";

// Every type a webpage slot may hold but a Column, which only Columns holds, and a Tab, which only Tabs holds
export const WEBPAGE_PLACEABLE_NODE_TYPES: WebpageNodeType[] = Object.values(WebpageNodeType).filter(
  (type) => type !== WebpageNodeType.Column && type !== WebpageNodeType.Tab,
);

// The elements a serialiser writes without a closing tag
export const WEBPAGE_VOID_TAGS: string[] = ["br", "hr", "img", "input", "meta", "source"];

import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
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

// The widest pixel width the tablet override applies at, after Webflow's breakpoints
export const TABLET_BREAKPOINT_WIDTH = 991;
// The narrowest desktop canvas, one pixel above the tablet breakpoint so the canvas's media queries always read desktop
export const DESKTOP_MIN_WIDTH = TABLET_BREAKPOINT_WIDTH + 1;
// The pixel width each device other than desktop draws the page at, inside its own breakpoint
export const DEVICE_WIDTH_MAP: Readonly<Record<Exclude<PageBuilderDevice, PageBuilderDevice.Desktop>, number>> =
  Object.freeze({ [PageBuilderDevice.Mobile]: 375, [PageBuilderDevice.Tablet]: 768 });

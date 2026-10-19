import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import type { WebpagePlaceableNode } from "#shared/models/pageBuilder/WebpagePlaceableNode";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";

// The most nodes a webpage may hold, counted across every slot, so a document cannot grow past what a render walks
export const MAX_WEBPAGE_NODES = 2000;
// The button colour of a survey invite. The GrapesJS editor keeps its own copy until the cutover removes that editor, and
// The shared folder cannot import the app's constant, so the value is held here
export const SURVEY_INVITE_BUTTON_COLOR = "#F63A4D";

// Every type a webpage slot may hold but a Column, which only Columns holds, and a Tab, which only Tabs holds
export const WEBPAGE_PLACEABLE_NODE_TYPES = [
  WebpageNodeType.Button,
  WebpageNodeType.Columns,
  WebpageNodeType.Countdown,
  WebpageNodeType.CustomHtml,
  WebpageNodeType.Image,
  WebpageNodeType.Section,
  WebpageNodeType.SurveyInvite,
  WebpageNodeType.Tabs,
  WebpageNodeType.Text,
  WebpageNodeType.Tooltip,
  WebpageNodeType.TypedText,
  WebpageNodeType.Video,
] satisfies WebpagePlaceableNode["type"][];

// The most characters a style value may hold, so one value cannot grow a rule past what a render writes
export const MAX_STYLE_VALUE_LENGTH = 200;
// The CSS properties the style panel offers, in the panel's sector order: layout, spacing, size, position, typography, background, border and effects
export const STYLE_PROPERTY_NAMES = [
  "display",
  "flex-direction",
  "justify-content",
  "align-items",
  "gap",
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
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-decoration",
  "color",
  "background-color",
  "background-image",
  "opacity",
  "border-width",
  "border-style",
  "border-color",
  "border-radius",
  "box-shadow",
] as const;
// The elements a serialiser writes without a closing tag
export const WEBPAGE_VOID_TAGS: string[] = ["br", "hr", "img", "input", "meta", "source"];

// The widest pixel width the tablet override applies at, after Webflow's breakpoints
export const TABLET_BREAKPOINT_WIDTH = 991;
// The widest pixel width the mobile override applies at, the narrowest of the three breakpoints
export const MOBILE_BREAKPOINT_WIDTH = 478;
// The narrowest desktop canvas, one pixel above the tablet breakpoint so the canvas's media queries always read desktop
export const DESKTOP_MIN_WIDTH = TABLET_BREAKPOINT_WIDTH + 1;
// The pixel width each device other than desktop draws the page at, inside its own breakpoint
export const DEVICE_WIDTH_MAP: Readonly<Record<Exclude<PageBuilderDevice, PageBuilderDevice.Desktop>, number>> =
  Object.freeze({ [PageBuilderDevice.Mobile]: 375, [PageBuilderDevice.Tablet]: 768 });

import type { WebpagePlaceableNode } from "#shared/models/pageBuilder/WebpagePlaceableNode";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";

// The most nodes a webpage may hold, counted across every slot, so a document cannot grow past what a render walks
export const MAX_WEBPAGE_NODES = 2000;
// The button colour of a survey invite, drawn the same on the webpage and in the email
export const SURVEY_INVITE_BUTTON_COLOR = "#F63A4D";
// The semantic tags a section renders under, which its props type and its schema both take
export const SECTION_TAGS = [HtmlTag.Div, HtmlTag.Footer, HtmlTag.Header, HtmlTag.Main, HtmlTag.Section] as const;

// Every type a webpage slot may hold but a Column, which only Columns holds, and a Tab, which only Tabs holds
export const WEBPAGE_PLACEABLE_NODE_TYPES = Object.values(WebpageNodeType).filter(
  (type): type is WebpagePlaceableNode["type"] => type !== WebpageNodeType.Column && type !== WebpageNodeType.Tab,
);

// The most characters a style value may hold, so one value cannot grow a rule past what a render writes
export const MAX_STYLE_VALUE_LENGTH = 200;
// The most characters a node's id may hold, and each of its text props: a label, a text, alt text or a title
export const MAX_NODE_ID_LENGTH = 64;
export const MAX_NODE_TEXT_LENGTH = 2000;
// The characters a node's id may hold, the ones a CSS class name takes, so an id cannot close the <style> element its class sits in
export const NODE_ID_REGEX = /^[\w-]+$/u;
// The most characters a custom HTML block's markup and a webpage's language tag may hold
export const MAX_NODE_HTML_LENGTH = 100_000;
export const MAX_LANG_LENGTH = 35;
// The most characters a page token's name may hold, its color- or font- prefix included
export const MAX_TOKEN_NAME_LENGTH = 64;
// The most tokens a page's theme may name, its colours and font stacks together
export const MAX_TOKEN_COUNT = 100;
// The prefixes a colour token and a font-stack token are named with, which the theme sorts them into
export const COLOR_TOKEN_PREFIX = "color-";
export const FONT_TOKEN_PREFIX = "font-";
// The most texts a typed text node cycles through
export const MAX_TYPED_TEXT_COUNT = 50;
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
// The breakpoints from the widest to the narrowest, the order their rules are written in, so a narrower override comes after a wider one
export const STYLE_BREAKPOINT_ORDER = [StyleBreakpoint.Base, StyleBreakpoint.Tablet, StyleBreakpoint.Mobile] as const;
// The pixel width each device other than desktop draws the page at, inside its own breakpoint
export const DEVICE_WIDTH_MAP: Readonly<Record<Exclude<PageBuilderDevice, PageBuilderDevice.Desktop>, number>> =
  Object.freeze({ [PageBuilderDevice.Mobile]: 375, [PageBuilderDevice.Tablet]: 768 });

// A UUID that names no survey, the one value a survey invite's id takes until its author chooses a survey
export const NO_SURVEY_ID = "00000000-0000-0000-0000-000000000000";
// The picture an inserted image or video shows until its author chooses a file. It is the app's own file, so a page that is
// Only opened in the editor requests no third-party origin
export const PLACEHOLDER_MEDIA_URL = "/page-builder/placeholder.svg";

import type { HtmlElement } from "#shared/models/pageBuilder/HtmlElement";
import type { HtmlRawNode } from "#shared/models/pageBuilder/HtmlRawNode";

// One piece of a render's output: an element, raw HTML, or text the serialiser escapes
export type HtmlNode = HtmlElement | HtmlRawNode | string;

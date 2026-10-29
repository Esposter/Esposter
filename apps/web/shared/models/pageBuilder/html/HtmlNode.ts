import type { HtmlElementNode } from "#shared/models/pageBuilder/html/HtmlElementNode";
import type { HtmlRawNode } from "#shared/models/pageBuilder/html/HtmlRawNode";
import type { HtmlTextNode } from "#shared/models/pageBuilder/html/HtmlTextNode";

// The element tree a node type renders, which one serialiser turns into HTML or MJML and the canvas into vnodes
export type HtmlNode = HtmlElementNode | HtmlRawNode | HtmlTextNode;

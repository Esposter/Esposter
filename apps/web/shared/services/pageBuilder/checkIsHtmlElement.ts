import type { HtmlElement } from "#shared/models/pageBuilder/HtmlElement";
import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";

// Whether a render's node is an element, rather than raw HTML or the text the serialiser escapes
export const checkIsHtmlElement = (node: HtmlNode): node is HtmlElement => typeof node !== "string" && "tag" in node;

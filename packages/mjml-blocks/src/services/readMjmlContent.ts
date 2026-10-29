import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { HTMLElement } from "node-html-parser";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { exhaustiveGuard, sanitizeHtml } from "@esposter/shared";

// A tag opens and closes in the content when a `<` starts a name before some `>`, which is the one `>` that ends the last tag, so the
// Pattern runs once over the text before it: a `<[^>]*>` pattern rescans to the end from every `<` of an unclosed run
const checkHasElement = (html: string): boolean => {
  const lastTagEnd = html.lastIndexOf(">");
  return lastTagEnd !== -1 && /<\/?[a-z]/iu.test(html.slice(0, lastTagEnd));
};

// An element's content as MJML wrote it: a label is its decoded text unless it holds an element, which its schema then refuses
export const readMjmlContent = <TContent extends MjmlRichText>(
  element: HTMLElement,
  contentKind: MjmlContentKind,
  richText: MjmlRichTextDefinition<TContent>,
): unknown => {
  const html = element.rawText;
  switch (contentKind) {
    case MjmlContentKind.Label:
      return checkHasElement(html) ? { html } : element.text;
    case MjmlContentKind.Raw:
      return sanitizeHtml(html);
    case MjmlContentKind.RichText:
      return richText.parseHtml(html);
    default:
      return exhaustiveGuard(contentKind);
  }
};

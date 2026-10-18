import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { HTMLElement } from "node-html-parser";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { exhaustiveGuard, sanitizeHtml } from "@esposter/shared";

// An element's content as MJML wrote it: a label is its decoded text unless it holds an element, which its schema then refuses
export const readMjmlContent = <TContent>(
  element: HTMLElement,
  contentKind: MjmlContentKind,
  richText: MjmlRichTextDefinition<TContent>,
): unknown => {
  const html = element.rawText;
  switch (contentKind) {
    case MjmlContentKind.Label:
      return /<\/?[a-z][^>]*>/iu.test(html) ? { html } : element.text;
    case MjmlContentKind.Raw:
      return sanitizeHtml(html);
    case MjmlContentKind.RichText:
      return richText.parseHtml(html);
    default:
      return exhaustiveGuard(contentKind);
  }
};

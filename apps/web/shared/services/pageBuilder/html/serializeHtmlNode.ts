import type { HtmlNode } from "#shared/models/pageBuilder/html/HtmlNode";

import { HtmlNodeType } from "#shared/models/pageBuilder/html/HtmlNodeType";
import { escapeAttribute, escapeText, exhaustiveGuard, VOID_TAGS } from "@esposter/shared";

export const serializeHtmlNode = (node: HtmlNode): string => {
  switch (node.type) {
    case HtmlNodeType.Element: {
      const attributes = Object.entries<string>(node.attributes)
        .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
        .join("");
      if (VOID_TAGS.includes(node.tag)) return `<${node.tag}${attributes}>`;
      return `<${node.tag}${attributes}>${node.children.map(serializeHtmlNode).join("")}</${node.tag}>`;
    }
    case HtmlNodeType.Raw:
      return node.html;
    case HtmlNodeType.Text:
      return escapeText(node.text);
    default:
      return exhaustiveGuard(node);
  }
};

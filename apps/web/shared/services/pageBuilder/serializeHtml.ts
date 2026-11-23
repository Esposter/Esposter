import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";

import { checkIsHtmlElement } from "#shared/services/pageBuilder/checkIsHtmlElement";
import { WEBPAGE_VOID_TAGS } from "#shared/services/pageBuilder/constants";
import { escapeAttribute, escapeText } from "@esposter/shared";

// Writes a render's tree as HTML: text escaped, raw HTML as it is, every attribute value escaped, and no closing tag
// For a void element
export const serializeHtml = (nodes: HtmlNode[]): string =>
  nodes
    .map((node) => {
      if (typeof node === "string") return escapeText(node);
      if (!checkIsHtmlElement(node)) return node.html;

      const attributes = Object.entries(node.attributes).flatMap(([name, value]) =>
        value === undefined ? [] : [` ${name}="${escapeAttribute(value)}"`],
      );
      const openingTag = `<${node.tag}${attributes.join("")}>`;
      if (WEBPAGE_VOID_TAGS.includes(node.tag)) return openingTag;
      else return `${openingTag}${serializeHtml(node.children)}</${node.tag}>`;
    })
    .join("");

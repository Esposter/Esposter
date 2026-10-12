import type { DefaultTreeAdapterTypes } from "parse5";

import { MAX_NESTING_DEPTH, NON_TEXT_TAGS } from "#src/services/sanitizeHtml/constants";
import { getChildNodes } from "#src/services/sanitizeHtml/getChildNodes";

// The text a tree shows, for the fallback when its markup cannot be kept stable. Non-text elements contribute nothing,
// As they would contribute nothing to the sanitised output
export const collectText = (nodes: DefaultTreeAdapterTypes.ChildNode[], depth: number): string =>
  depth > MAX_NESTING_DEPTH
    ? ""
    : nodes
        .map((node) => {
          if ("value" in node) return node.value;
          if (!("tagName" in node) || NON_TEXT_TAGS.includes(node.tagName)) return "";

          return collectText(getChildNodes(node), depth + 1);
        })
        .join("");

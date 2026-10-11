import type { SanitizePolicy } from "#src/models/sanitizeHtml/SanitizePolicy";

import { defaultTreeAdapter, parseFragment } from "parse5";
import { HTML_NAMESPACE } from "#src/services/sanitizeHtml/constants";
import { collectText } from "#src/services/sanitizeHtml/collectText";
import { escapeText } from "#src/services/sanitizeHtml/escapeText";
import { renderNode } from "#src/services/sanitizeHtml/renderNode";

// The fragment is parsed as a body's would be, the context a rich-text container renders into, so the tree a browser
// Builds from the output is the tree this filter read. The output is then parsed and filtered again: markup that does
// Not come back unchanged is one a second parse could read as a different tree, so it is replaced by its text
export const filterHtml = (html: string, policy: SanitizePolicy): string => {
  const context = defaultTreeAdapter.createElement("body", HTML_NAMESPACE, []);
  const childNodes = parseFragment(context, html, {}).childNodes;
  const output = childNodes.map((node) => renderNode(node, policy, 0)).join("");

  const reparsedNodes = parseFragment(context, output, {}).childNodes;
  const reparsedOutput = reparsedNodes.map((node) => renderNode(node, policy, 0)).join("");
  return reparsedOutput === output ? output : escapeText(collectText(childNodes, 0));
};

import type { DefaultTreeAdapterTypes } from "parse5";
import type { SanitizePolicy } from "#src/models/sanitizeHtml/SanitizePolicy";

import { HTML_NAMESPACE, MAX_NESTING_DEPTH, NON_TEXT_TAGS, VOID_TAGS } from "#src/services/sanitizeHtml/constants";
import { escapeAttribute } from "#src/services/sanitizeHtml/escapeAttribute";
import { escapeText } from "#src/services/sanitizeHtml/escapeText";
import { filterAttributes } from "#src/services/sanitizeHtml/filterAttributes";

const getChildNodes = (element: DefaultTreeAdapterTypes.Element): DefaultTreeAdapterTypes.ChildNode[] =>
  // A template keeps its children in a fragment of their own rather than under the element
  "content" in element ? (element.content as DefaultTreeAdapterTypes.DocumentFragment).childNodes : element.childNodes;

// Renders a parsed node as the markup it is allowed to be. Anything the policy does not name is unwrapped to its text,
// Or dropped with its content when it is a non-text element, so the output is built from allowed parts only
export const renderNode = (node: DefaultTreeAdapterTypes.ChildNode, policy: SanitizePolicy, depth: number): string => {
  if (node.nodeName === "#text") return escapeText((node as DefaultTreeAdapterTypes.TextNode).value);
  if (!("tagName" in node) || depth > MAX_NESTING_DEPTH) return "";

  const element = node;
  const children = getChildNodes(element)
    .map((child) => renderNode(child, policy, depth + 1))
    .join("");
  const isAllowed =
    element.namespaceURI === HTML_NAMESPACE &&
    !NON_TEXT_TAGS.includes(element.tagName) &&
    policy.allowedTags.includes(element.tagName);
  if (!isAllowed) return NON_TEXT_TAGS.includes(element.tagName) ? "" : children;

  const attributes = Object.entries(filterAttributes(element, policy))
    .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
    .join("");
  const opening = `<${element.tagName}${attributes}>`;
  return VOID_TAGS.includes(element.tagName) ? opening : `${opening}${children}</${element.tagName}>`;
};

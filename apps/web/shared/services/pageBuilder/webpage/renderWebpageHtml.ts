import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { WebpageDocument } from "#shared/models/pageBuilder/webpage/WebpageDocument";

import { flattenPageNodes } from "#shared/services/pageBuilder/flattenPageNodes";
import { serializeHtmlNode } from "#shared/services/pageBuilder/html/serializeHtmlNode";
import { getWebpageNodeTypeDefinitions } from "#shared/services/pageBuilder/webpage/getWebpageNodeTypeDefinitions";
import { renderWebpageCss } from "#shared/services/pageBuilder/webpage/renderWebpageCss";
import { renderWebpageNode } from "#shared/services/pageBuilder/webpage/renderWebpageNode";
import { WebpageNodeTypeMap } from "#shared/services/pageBuilder/webpage/WebpageNodeTypeMap";
import { escapeAttribute, escapeText } from "@esposter/shared";

// One self-contained document: the stylesheet in the head, the body, then each present type's script in an element of
// Its own, so one that throws does not stop the rest
export const renderWebpageHtml = ({ content, root }: WebpageDocument, context: RenderContext) => {
  const nodes = flattenPageNodes(WebpageNodeTypeMap, content);
  const body = content.map((node) => serializeHtmlNode(renderWebpageNode(node, context))).join("");
  const scripts = getWebpageNodeTypeDefinitions(nodes)
    .map((definition) => ("script" in definition ? `<script>${definition.script}</script>` : ""))
    .join("");
  return `<!doctype html><html lang="${escapeAttribute(root.props.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeText(root.props.title)}</title><style>${renderWebpageCss(root.props.tokens, nodes)}</style></head><body>${body}${scripts}</body></html>`;
};

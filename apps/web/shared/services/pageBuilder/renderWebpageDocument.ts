import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { webpageNodeTypeDefinitionMap } from "#shared/services/pageBuilder/webpageNodeTypeDefinitionMap";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { escapeAttribute } from "@esposter/shared";
import { renderBlockNodes } from "headless-block-editor";

// A pure render: one HTML document, with each type the page holds contributing its CSS once and its script once, so the
// Output runs the same in the browser that exports it and on the server that publishes it
export const renderWebpageDocument = (document: WebpageDocument, context: RenderContext): string => {
  const presentTypes = new Set<string>();
  const content: HtmlNode[] = renderBlockNodes(document.content, webpageRegistry, (node, definition, slots) => {
    presentTypes.add(definition.type);
    return definition.render(node, slots, context);
  });
  const definitions = Object.values(webpageNodeTypeDefinitionMap).filter((definition) =>
    presentTypes.has(definition.type),
  );
  const css = definitions.map(({ css }) => css).join("\n");
  const scripts = definitions.flatMap(({ script }) => (script ? [`<script>(${script.toString()})()</script>`] : []));

  return `<!doctype html><html lang="${escapeAttribute(document.root.props.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body>${serializeHtml(content)}${scripts.join("")}</body></html>`;
};

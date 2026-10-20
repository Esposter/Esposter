import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { getNodeStyleClass } from "#shared/services/pageBuilder/getNodeStyleClass";
import { getNodeStyleCss } from "#shared/services/pageBuilder/getNodeStyleCss";
import { getPresentDefinitions } from "#shared/services/pageBuilder/getPresentDefinitions";
import { getWebpageCss } from "#shared/services/pageBuilder/getWebpageCss";
import { renderWebpageNode } from "#shared/services/pageBuilder/renderWebpageNode";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { escapeAttribute } from "@esposter/shared";
import { renderBlockNodes } from "headless-block-editor";

// A pure render: one HTML document, with each type the page holds contributing its CSS once and its script once, so the
// Output runs the same in the browser that exports it and on the server that publishes it. The document is parsed first,
// So a style value or a URL the schema refuses throws rather than being written into the page
export const renderWebpageDocument = (input: WebpageDocument, context: RenderContext): string => {
  const document = webpageDocumentSchema.parse(input);
  const content: HtmlNode[] = renderBlockNodes(
    document.content,
    webpageRegistry,
    webpageNodeChildren,
    (node, definition, slots) => {
      const rendered = renderWebpageNode(node, slots, context);
      if (getNodeStyleCss(node, definition) === "" || typeof rendered === "string" || !("tag" in rendered))
        return rendered;

      return {
        ...rendered,
        attributes: {
          ...rendered.attributes,
          [HtmlAttributeName.Class]:
            `${rendered.attributes[HtmlAttributeName.Class] ?? ""} ${getNodeStyleClass(node)}`.trim(),
        },
      };
    },
  );
  const definitions = getPresentDefinitions(document);
  const scripts = definitions.flatMap(({ script }) => (script ? [`<script>(${String(script)})()</script>`] : []));

  return `<!doctype html><html lang="${escapeAttribute(document.root.props.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${getWebpageCss(document, definitions)}</style></head><body>${serializeHtml(content)}${scripts.join("")}</body></html>`;
};

import type { HtmlElement } from "#shared/models/pageBuilder/HtmlElement";
import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";
import type { HtmlRawNode } from "#shared/models/pageBuilder/HtmlRawNode";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { VNode } from "vue";

import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { renderBlockNodes } from "headless-block-editor";
import { createStaticVNode, h } from "vue";
import { z } from "zod";

const nodeIdPropsSchema = z.object({ id: z.string() });

const checkIsRawNode = (node: HtmlNode): node is HtmlRawNode => typeof node !== "string" && !("tag" in node);

// Renders a webpage's document as the canvas's VNodes, folding its nodes through the same registry and render the published
// Page uses, so the canvas shows the layout the page has. Each node's root element carries its id in the canvas only, so an
// Overlay can find the node's box, and no script runs there, since the raw type's markup is inserted as inner HTML
export const renderCanvasVNodes = (document: WebpageDocument, context: RenderContext): VNode[] => {
  const nodeIds = new WeakMap<HtmlElement, string>();
  const content: HtmlNode[] = renderBlockNodes(document.content, webpageRegistry, (node, definition, slots) => {
    const rendered = definition.render(node, slots, context);
    if (typeof rendered !== "string" && "tag" in rendered)
      nodeIds.set(rendered, nodeIdPropsSchema.parse(node.props).id);
    return rendered;
  });

  const toVNode = (node: HtmlNode): string | VNode => {
    if (typeof node === "string") return node;
    if (checkIsRawNode(node)) return createStaticVNode(node.html, 1);

    const nodeId = nodeIds.get(node);
    const attributes = nodeId === undefined ? node.attributes : { ...node.attributes, "data-node-id": nodeId };
    if (node.children.some(checkIsRawNode))
      return h(node.tag, { ...attributes, innerHTML: serializeHtml(node.children) });

    return h(node.tag, attributes, node.children.map(toVNode));
  };

  return content.map(toVNode);
};

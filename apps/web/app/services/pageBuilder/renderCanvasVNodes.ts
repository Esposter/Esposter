import type { HtmlElement } from "#shared/models/pageBuilder/HtmlElement";
import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";
import type { HtmlRawNode } from "#shared/models/pageBuilder/HtmlRawNode";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageKind } from "@/models/pageBuilder/WebpageKind";
import type { VNode } from "vue";

import { renderWebpageNode } from "#shared/services/pageBuilder/renderWebpageNode";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { renderBlockNodes } from "headless-block-editor";
import { createStaticVNode, createTextVNode } from "vue";

const checkIsElement = (node: HtmlNode): node is HtmlElement => typeof node !== "string" && "tag" in node;
const checkIsRawNode = (node: HtmlNode): node is HtmlRawNode => typeof node !== "string" && !checkIsElement(node);

// Renders a webpage's document as the canvas's VNodes, folding its nodes through the same registry and render the published
// Page uses, so the canvas shows the layout the page has. Each node's root element carries its id in the canvas only, so an
// Overlay can find the node's box, and no script runs there, since the raw type's markup is inserted as inner HTML
export const renderCanvasVNodes = (kind: WebpageKind, document: WebpageDocument, context: RenderContext): VNode[] => {
  const nodeIds = new WeakMap<HtmlElement, string>();
  const content: HtmlNode[] = renderBlockNodes(
    document.content,
    kind.registry,
    kind.children,
    (node, _definition, slots) => {
      const rendered = renderWebpageNode(node, slots, context);
      if (checkIsElement(rendered)) nodeIds.set(rendered, node.props.id);
      return rendered;
    },
  );

  const toVNode = (node: HtmlNode): VNode => {
    if (typeof node === "string") return createTextVNode(node);
    if (checkIsRawNode(node)) return createStaticVNode(node.html, 1);

    const nodeId = nodeIds.get(node);
    const attributes = nodeId === undefined ? node.attributes : { ...node.attributes, "data-node-id": nodeId };
    if (node.children.some((child) => checkIsRawNode(child)))
      return h(node.tag, { ...attributes, innerHTML: serializeHtml(node.children) });

    return h(
      node.tag,
      attributes,
      node.children.map((child) => toVNode(child)),
    );
  };

  return content.map((contentNode) => toVNode(contentNode));
};

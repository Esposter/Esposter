import type { EmailCanvasContext } from "@/models/pageBuilder/EmailCanvasContext";
import type { EmailDocument } from "@/models/pageBuilder/EmailDocument";
import type { EmailKind } from "@/models/pageBuilder/EmailKind";
import type { VNode } from "vue";

import { checkIsStackedColumns } from "#shared/services/pageBuilder/email/checkIsStackedColumns";
import { getEmailAttributeValue } from "#shared/services/pageBuilder/email/getEmailAttributeValue";
import { EmailCanvasDrawingMap } from "@/services/pageBuilder/email/canvasDrawing/EmailCanvasDrawingMap";
import { renderBlockNodes } from "headless-block-editor";
import { cloneVNode } from "vue";

// The CSS property each MJML attribute the canvas draws is written as. An attribute its node's component does not take is
// Not drawn, so a link's href or an image's source never reaches the style
const CANVAS_STYLE_PROPERTY_MAP: Readonly<Record<string, string>> = Object.freeze({
  align: "textAlign",
  "background-color": "backgroundColor",
  "border-radius": "borderRadius",
  color: "color",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  height: "height",
  "line-height": "lineHeight",
  padding: "padding",
});
// The design canvas's view of an email: each node drawn as the element it becomes, by its type's drawing in the map.
// Every attribute is the one the MJML cascade resolves for it.
export const renderEmailCanvasVNodes = (kind: EmailKind, document: EmailDocument, width: number): VNode[] => {
  const rootAttributes = document.root.props.attributes;
  const isStacked = checkIsStackedColumns(width);

  return renderBlockNodes(document.content, kind.registry, kind.children, (node, definition, slots) => {
    const attribute = (name: string) => getEmailAttributeValue(node, name, rootAttributes) || "";
    // Only the attributes the component declares are drawn, since the cascade's root-wide defaults reach every tag
    const style = Object.fromEntries(
      Object.entries(CANVAS_STYLE_PROPERTY_MAP)
        .filter(([name]) => Object.hasOwn(definition.allowedAttributes, name))
        .map(([name, property]) => [property, attribute(name)]),
    );
    const context: EmailCanvasContext = { attribute, childNodes: Object.values(slots).flat(), isStacked, kind, style };
    const drawing = EmailCanvasDrawingMap[node.type](node as never, context);
    // Each drawn node's root element carries the node's id, so the canvas can outline it on hover and select it on click
    return cloneVNode(drawing, { "data-node-id": node.props.id });
  });
};

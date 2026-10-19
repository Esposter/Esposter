import type { MjmlJson } from "#src/models/MjmlJson";
import type { MjmlRenderSpecification } from "#src/models/MjmlRenderSpecification";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { BlockNode } from "headless-block-editor";

import { MjmlAttributeKind } from "#src/models/MjmlAttributeKind";
import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { parseMjmlAttributeType } from "#src/services/parseMjmlAttributeType";
import { escapeAttribute, escapeText, exhaustiveGuard, InvalidOperationError, Operation } from "@esposter/shared";
import { getBlockPropValue } from "headless-block-editor";
import { z } from "zod";

// A built-in component's render: its set attributes, the alternative text its flag writes, its children or its content, each escaped once
// Each prop is unknown until its guard or parse narrows it, so the render reads the node as the core holds it and never as a typed props object
export const renderMjmlNode = <TContent>(
  specification: MjmlRenderSpecification,
  richText?: MjmlRichTextDefinition<TContent>,
) => {
  const attributeTypes = Object.entries(specification.allowedAttributes).map(([name, grammar]) => ({
    name,
    type: parseMjmlAttributeType(grammar),
  }));

  return (node: BlockNode, slots: Record<string, MjmlJson[]>): MjmlJson => {
    const attributes: Record<string, boolean | string> = {};
    for (const { name, type } of attributeTypes) {
      const value = getBlockPropValue(node.props, name);
      if (typeof value === "string")
        attributes[name] = type.kind === MjmlAttributeKind.Boolean ? value === "true" : escapeAttribute(value);
    }
    if (specification.hasAlternativeText && getBlockPropValue(node.props, "decorative") === true) attributes.alt = "";

    const element = { attributes, tagName: specification.tagName };
    if (specification.hasChildren) return { ...element, children: slots.children ?? [] };

    switch (specification.contentKind) {
      case MjmlContentKind.Label: {
        const parsedLabel = z.string().parse(getBlockPropValue(node.props, "content"));
        return { ...element, content: escapeText(parsedLabel) };
      }
      case MjmlContentKind.Raw:
        return { ...element, content: z.string().parse(getBlockPropValue(node.props, "content")) };
      case MjmlContentKind.RichText: {
        if (richText === undefined)
          throw new InvalidOperationError(
            Operation.Read,
            specification.tagName,
            "needs a rich text definition to render",
          );

        const parsedRichText = richText.schema.parse(getBlockPropValue(node.props, "content"));
        return { ...element, content: richText.renderHtml(parsedRichText) };
      }
      case undefined:
        return element;
      default:
        return exhaustiveGuard(specification.contentKind);
    }
  };
};

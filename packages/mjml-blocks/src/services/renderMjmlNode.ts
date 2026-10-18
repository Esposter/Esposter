import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";
import type { MjmlJson } from "#src/models/MjmlJson";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { BlockNode } from "headless-block-editor";

import { MjmlAttributeKind } from "#src/models/MjmlAttributeKind";
import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { parseMjmlAttributeType } from "#src/services/parseMjmlAttributeType";
import { escapeAttribute, escapeText, exhaustiveGuard } from "@esposter/shared";
import { z } from "zod";

// A built-in type's render: its set attributes, the alternative text its flag writes, its children or its content, each escaped once
export const renderMjmlNode = <TContent>(
  specification: MjmlComponentSpecification,
  richText: MjmlRichTextDefinition<TContent>,
): ((node: BlockNode, slots: Record<string, MjmlJson[]>) => MjmlJson) => {
  const attributeTypes = Object.entries(specification.allowedAttributes).map(([name, grammar]) => ({
    name,
    type: parseMjmlAttributeType(grammar),
  }));

  return (node, slots) => {
    const attributes: Record<string, boolean | string> = {};
    for (const { name, type } of attributeTypes) {
      const value = node.props[name];
      if (typeof value === "string")
        attributes[name] = type.kind === MjmlAttributeKind.Boolean ? value === "true" : escapeAttribute(value);
    }
    if (specification.hasAlternativeText && node.props.decorative === true) attributes.alt = "";

    const element = { attributes, tagName: specification.type };
    if (specification.children.length > 0) return { ...element, children: slots.children ?? [] };

    switch (specification.contentKind) {
      case MjmlContentKind.Label: {
        const parsedLabel = z.string().parse(node.props.content);
        return { ...element, content: escapeText(parsedLabel) };
      }
      case MjmlContentKind.Raw:
        return { ...element, content: z.string().parse(node.props.content) };
      case MjmlContentKind.RichText: {
        const parsedRichText = richText.schema.parse(node.props.content);
        return { ...element, content: richText.renderHtml(parsedRichText) };
      }
      case undefined:
        return element;
      default:
        return exhaustiveGuard(specification.contentKind);
    }
  };
};

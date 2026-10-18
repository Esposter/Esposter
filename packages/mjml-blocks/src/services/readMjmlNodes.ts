import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { BlockNode, BlockRegistry } from "headless-block-editor";
import type { Node } from "node-html-parser";

import { MJML_COMPONENT_SPECIFICATIONS, STRAY_TEXT_TYPE } from "#src/services/constants";
import { readMjmlContent } from "#src/services/readMjmlContent";
import { normalizeString } from "@esposter/shared";
import { getBlockTypeDefinition } from "headless-block-editor";
import { HTMLElement, TextNode } from "node-html-parser";

// A tag as a node of its type: an empty alternative text marks it decorative, its content is read by its kind, and its children
// are read when its definition has a slot or it holds any, so a child that no slot takes is refused by name
const readMjmlNode = <TContent>(
  element: HTMLElement,
  registry: BlockRegistry<MjmlBlockTypeDefinition>,
  richText: MjmlRichTextDefinition<TContent>,
): BlockNode => {
  const type = element.rawTagName;
  const specification = MJML_COMPONENT_SPECIFICATIONS.find((specification) => specification.type === type);
  const { alt, ...attributes } = element.attributes;
  const isDecorative = specification?.hasAlternativeText === true && alt === "";
  const props: Record<string, unknown> = {
    id: crypto.randomUUID(),
    ...(isDecorative ? { ...attributes, decorative: true } : element.attributes),
  };

  if (specification?.contentKind === undefined) {
    const children = readMjmlNodes(element.childNodes, registry, richText);
    const definition = getBlockTypeDefinition(registry, type);
    if (children.length > 0 || Object.keys(definition?.slots ?? {}).length > 0) props.children = children;
  } else props.content = readMjmlContent(element, specification.contentKind, richText);

  return { props, type };
};

// The nodes of a list of children: each element a node, each text that is not blank a node no registry holds
export const readMjmlNodes = <TContent>(
  children: Node[],
  registry: BlockRegistry<MjmlBlockTypeDefinition>,
  richText: MjmlRichTextDefinition<TContent>,
): BlockNode[] =>
  children.flatMap((child) => {
    if (child instanceof HTMLElement) return [readMjmlNode(child, registry, richText)];
    if (child instanceof TextNode && normalizeString(child.text) !== "")
      return [{ props: { content: child.text, id: crypto.randomUUID() }, type: STRAY_TEXT_TYPE }];
    return [];
  });

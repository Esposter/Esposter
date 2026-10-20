import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { Node } from "node-html-parser";

import { STRAY_ID_ATTRIBUTE_KEY, STRAY_TEXT_TYPE } from "#src/services/constants";
import { readMjmlContent } from "#src/services/readMjmlContent";
import { normalizeString } from "@esposter/shared";
import { getBlockTypeDefinition } from "headless-block-editor";
import { HTMLElement, TextNode } from "node-html-parser";

// A tag as a node of its type: an empty alternative text marks it decorative, its content is read by its kind, and its children
// Are read when its definition has a slot or it holds any, so a child that no slot takes is refused by name
// The node is the candidate the document schema parses, so it is unknown until that parse narrows it
const readMjmlNode = <TContext, TContent extends MjmlRichText>(
  element: HTMLElement,
  registry: MjmlRegistry<TContext>,
  richText: MjmlRichTextDefinition<TContent>,
) => {
  const type = element.rawTagName;
  const definition = getBlockTypeDefinition(registry, type);
  const { alt, id: idAttribute, ...attributes } = element.attributes;
  const isDecorative = definition?.hasAlternativeText === true && alt === "";
  const entries: [string, unknown][] = [];
  for (const name of Object.keys(attributes)) entries.push([name, attributes[name]]);
  if (isDecorative) entries.push(["decorative", true]);
  else if (alt !== undefined) entries.push(["alt", alt]);
  if (idAttribute !== undefined) entries.push([STRAY_ID_ATTRIBUTE_KEY, idAttribute]);
  entries.push(["id", crypto.randomUUID()]);

  if (definition?.contentKind === undefined) {
    const children = readMjmlNodes(element.childNodes, registry, richText);
    if (children.length > 0 || Object.keys(definition?.slots ?? {}).length > 0) entries.push(["children", children]);
  } else entries.push(["content", readMjmlContent(element, definition.contentKind, richText)]);

  return { props: Object.fromEntries(entries), type };
};

// The nodes of a list of children: each element a node, each text that is not blank a node no registry holds
export const readMjmlNodes = <TContext, TContent extends MjmlRichText>(
  children: Node[],
  registry: MjmlRegistry<TContext>,
  richText: MjmlRichTextDefinition<TContent>,
): unknown[] =>
  children.flatMap((child) => {
    if (child instanceof HTMLElement) return [readMjmlNode(child, registry, richText)];
    if (child instanceof TextNode && normalizeString(child.text) !== "")
      return [{ props: { content: child.text, id: crypto.randomUUID() }, type: STRAY_TEXT_TYPE }];
    return [];
  });

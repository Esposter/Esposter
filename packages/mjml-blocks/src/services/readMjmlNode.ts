import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { HTMLElement, Node } from "node-html-parser";

import { STRAY_ID_ATTRIBUTE_KEY } from "#src/services/constants";
import { getMjmlRefusalKey } from "#src/services/getMjmlRefusalKey";
import { readMjmlContent } from "#src/services/readMjmlContent";
import { getBlockTypeDefinition } from "headless-block-editor";

// A tag as a node of its type: an empty alternative text marks it decorative, its content is read by its kind, and its children
// Are read when its definition has a slot or it holds any, so a child that no slot takes is refused by name
// The node is the candidate the document schema parses, so it is unknown until that parse narrows it
// Children are read by the list reader the caller passes in, which keeps this file from importing the list reader back
export const readMjmlNode = <TContext, TContent extends MjmlRichText>(
  element: HTMLElement,
  registry: MjmlRegistry<TContext>,
  richText: MjmlRichTextDefinition<TContent>,
  readChildNodes: (childNodes: Node[]) => unknown[],
): { props: Record<string, unknown>; type: string } => {
  const type = element.rawTagName;
  const definition = getBlockTypeDefinition(registry, type);
  const { alt, id: idAttribute, ...attributes } = element.attributes;
  const isDecorative = definition?.hasAlternativeText === true && alt === "";
  const slotNames = Object.keys(definition?.slots ?? {});
  // A source attribute named after a prop the node writes itself is refused under its name, so it cannot overwrite that prop
  const reservedNames = new Set([
    ...slotNames,
    ...(definition?.contentKind === undefined ? [] : ["content"]),
    ...(definition?.hasAlternativeText === true ? ["decorative"] : []),
  ]);
  const entries: [string, unknown][] = [];
  for (const name of Object.keys(attributes))
    entries.push([reservedNames.has(name) ? getMjmlRefusalKey(name) : name, attributes[name]]);
  if (isDecorative) entries.push(["decorative", true]);
  else if (alt !== undefined) entries.push(["alt", alt]);
  if (idAttribute !== undefined) entries.push([STRAY_ID_ATTRIBUTE_KEY, idAttribute]);
  entries.push(["id", crypto.randomUUID()]);

  if (definition?.contentKind === undefined) {
    const children = readChildNodes(element.childNodes);
    if (children.length > 0 || slotNames.length > 0) entries.push(["children", children]);
  } else entries.push(["content", readMjmlContent(element, definition.contentKind, richText)]);

  return { props: Object.fromEntries(entries), type };
};

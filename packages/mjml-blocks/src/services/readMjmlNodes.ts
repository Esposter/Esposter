import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { Node } from "node-html-parser";

import { STRAY_TEXT_TYPE } from "#src/services/constants";
import { readMjmlNode } from "#src/services/readMjmlNode";
import { normalizeString } from "@esposter/shared";
import { HTMLElement, TextNode } from "node-html-parser";

// The nodes of a list of children: each element a node, each text that is not blank a node no registry holds
export const readMjmlNodes = <TContext, TContent extends MjmlRichText>(
  children: Node[],
  registry: MjmlRegistry<TContext>,
  richText: MjmlRichTextDefinition<TContent>,
): unknown[] =>
  children.flatMap((child) => {
    if (child instanceof HTMLElement)
      return [
        readMjmlNode(child, registry, richText, (grandchildren) => readMjmlNodes(grandchildren, registry, richText)),
      ];
    if (child instanceof TextNode && normalizeString(child.text) !== "")
      return [{ props: { content: child.text, id: crypto.randomUUID() }, type: STRAY_TEXT_TYPE }];
    return [];
  });

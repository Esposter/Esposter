import type { MjmlAccordionTextNode } from "#src/models/MjmlAccordionTextNode";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlTextNode } from "#src/models/MjmlTextNode";

// What a rich-text component declares beside its content: its attributes and defaults in MJML's grammar, its props schema, its slots and its type tag
export interface MjmlRichTextTypeOptions<TNode extends MjmlAccordionTextNode | MjmlTextNode> {
  allowedAttributes: Record<string, string>;
  defaultAttributes: Record<string, string>;
  propsSchema: MjmlBlockTypeDefinition<TNode>["propsSchema"];
  slots: MjmlBlockTypeDefinition<TNode>["slots"];
  type: TNode["type"];
}

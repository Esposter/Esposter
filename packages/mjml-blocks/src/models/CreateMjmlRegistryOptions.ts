import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { MjmlNode } from "#src/models/MjmlNode";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { BlockChildren } from "headless-block-editor";

// The consumer's half of a registry: the leaf types MJML's columns and heroes take beside its own, the rich text its text components hold, and the children port
// That port is the consumer's composition: it handles each leaf type and delegates every other node to MJML's built-in port
export interface CreateMjmlRegistryOptions<TContent extends MjmlRichText = MjmlRichText, TContext = unknown> {
  children: BlockChildren<MjmlNode>;
  leafTypes: MjmlBlockTypeDefinition<MjmlLeafNode, TContext>[];
  richText: MjmlRichTextDefinition<TContent>;
}

import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";

// The consumer's half of a registry: the leaf types MJML's columns and heroes take beside its own, and the rich text its text components hold
export interface CreateMjmlRegistryOptions<TContent = unknown, TContext = unknown> {
  leafTypes: MjmlBlockTypeDefinition<MjmlLeafNode, TContext>[];
  richText: MjmlRichTextDefinition<TContent>;
}

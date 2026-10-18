import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";

export interface CreateMjmlRegistryOptions<TContent = unknown> {
  leafTypes: MjmlBlockTypeDefinition[];
  richText: MjmlRichTextDefinition<TContent>;
}

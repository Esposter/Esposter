import type { MjmlLeafNodeSchema } from "#src/models/MjmlLeafNodeSchema";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";

// The consumer's half of the node schema: the schema of its leaf node, which a column or a hero takes beside MJML's own, and the rich text its text components hold
export interface CreateMjmlNodeSchemaOptions<TContent extends MjmlRichText = MjmlRichText> {
  leafNodeSchema: MjmlLeafNodeSchema;
  richText: MjmlRichTextDefinition<TContent>;
}

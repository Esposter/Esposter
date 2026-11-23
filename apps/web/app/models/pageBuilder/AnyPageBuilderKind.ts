import type { PageBuilderKind } from "#src/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockTypeDefinition } from "vue-block-editor-headless";
import type { z } from "zod";

// The kind the shell and its children hold, over any node type, so the webpage's kind and the email's both assign to it
// Its document is the block document the shell holds of any kind, which the kind's own document type narrows
export type AnyPageBuilderKind = PageBuilderKind<
  BlockNode,
  object,
  { formSchema: z.ZodType } & BlockTypeDefinition,
  BlockDocument
>;

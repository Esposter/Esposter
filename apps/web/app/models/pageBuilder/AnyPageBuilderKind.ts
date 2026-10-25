import type { AnyPageBuilderDocument } from "@/models/pageBuilder/AnyPageBuilderDocument";
import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";
import type { z } from "zod";

// The kind the shell and its children hold, over any node type, so the webpage's kind and the email's both assign to it
export type AnyPageBuilderKind = PageBuilderKind<
  BlockNode,
  BlockRootProps,
  BlockTypeDefinition<BlockNode> & { formSchema: z.ZodType },
  AnyPageBuilderDocument
>;

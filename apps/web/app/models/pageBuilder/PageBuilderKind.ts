import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { WebpageNodeDefinition } from "#shared/models/pageBuilder/WebpageNodeDefinition";
import type { WebpageRootProps } from "#shared/models/pageBuilder/WebpageRootProps";
import type { BlockChildren, BlockRegistry } from "headless-block-editor";
import type { ZodType } from "zod";

// A kind of document the page builder shell edits. The shell reads a document through its kind: the schema a loaded
// Document is parsed by, the registry of its block types and the children port that walks its tree. The rest of what a
// Kind holds joins as the shell's composables move onto it
export interface PageBuilderKind {
  children: BlockChildren<WebpageNode>;
  documentSchema: ZodType<WebpageDocument>;
  registry: BlockRegistry<WebpageNode, WebpageRootProps, WebpageNodeDefinition>;
}

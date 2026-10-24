import type { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import type {
  BlockChildren,
  BlockNode,
  BlockRegistry,
  BlockRootProps,
  BlockTypeDefinition,
} from "headless-block-editor";
import type { z } from "zod";

// A kind of document the page builder shell edits, over its node, root props, node definition and document types. The
// Shell reads a document through its kind: the schema a loaded document is parsed by, the registry of its block types and
// The children port that walks its tree. The webpage's and the email's kinds are the two that hold these
export interface PageBuilderKind<
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument,
> {
  children: BlockChildren<TNode>;
  documentSchema: z.ZodType<TDocument>;
  // The editor a copied node is tagged with, so a paste can refuse a node from an editor the target does not take
  editor: PageBuilderEditor;
  // The schema one node parses by, which a duplicate or a paste checks its copy against before it is written
  nodeSchema: z.ZodType<TNode>;
  registry: BlockRegistry<TNode, TRoot, TDefinition>;
  // The title each node type is shown by in the layers, the palette and the paths the shell names a slot with
  titles: Readonly<Record<string, string>>;
}

import type {
  BlockChildren,
  BlockNode,
  BlockRegistry,
  BlockRootProps,
  BlockTypeDefinition,
} from "headless-block-editor";
import type { ZodType } from "zod";

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
  documentSchema: ZodType<TDocument>;
  registry: BlockRegistry<TNode, TRoot, TDefinition>;
}

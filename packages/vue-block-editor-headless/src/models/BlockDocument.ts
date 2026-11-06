import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRootProps } from "#src/models/BlockRootProps";

// A document: its content, and its root's props typed by the registry's root schema once a document schema has parsed it
// The content holds only the nodes the root accepts, which are all of the node union unless a consumer names the narrower type
export interface BlockDocument<
  TNode extends BlockNode = BlockNode,
  TRootProps extends BlockRootProps = BlockRootProps,
  TRootNode extends TNode = TNode,
> {
  content: TRootNode[];
  root: { props: TRootProps };
}

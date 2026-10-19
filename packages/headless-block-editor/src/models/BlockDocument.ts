import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRootProps } from "#src/models/BlockRootProps";

// A document: its content, and its root's props typed by the registry's root schema once a document schema has parsed it
export interface BlockDocument<
  TNode extends BlockNode = BlockNode,
  TRootProps extends BlockRootProps = BlockRootProps,
> {
  content: TNode[];
  root: { props: TRootProps };
}

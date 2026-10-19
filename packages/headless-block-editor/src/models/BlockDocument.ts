import type { BlockNode } from "#src/models/BlockNode";

// A document: its content, and its root's props typed by the registry's root schema once a document schema has parsed it
export interface BlockDocument<TNode extends BlockNode = BlockNode, TRootProps extends object = object> {
  content: TNode[];
  root: { props: TRootProps };
}

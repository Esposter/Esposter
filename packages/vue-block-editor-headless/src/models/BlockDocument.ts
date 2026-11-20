import type { BlockNode } from "#src/models/BlockNode";

// A document: its content, and its root's props typed by the registry's root schema once a document schema has parsed it
// The core reads none of those props, so the constraint names none: TRootProps is `object` until a registry's schema types it
// The content holds only the nodes the root accepts, which are all of the node union unless a consumer names the narrower type
export interface BlockDocument<
  TNode extends BlockNode = BlockNode,
  TRootProps extends object = object,
  TRootNode extends TNode = TNode,
> {
  content: TRootNode[];
  root: { props: TRootProps };
}

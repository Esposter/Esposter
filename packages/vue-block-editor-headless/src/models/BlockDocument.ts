import type { BlockNode } from "#src/models/BlockNode";

// A document: its content, and its root's props.
// The root's props are typed by the registry's root schema once a document schema has parsed it.
// The core reads none of those props, so the constraint names none.
// Until a registry's schema types it, `TRootProps` is `object`.
// The content holds only the nodes the root accepts.
// Those are all of the node union unless a consumer names the narrower type.
export interface BlockDocument<
  TNode extends BlockNode = BlockNode,
  TRootProps extends object = object,
  TRootNode extends TNode = TNode,
> {
  content: TRootNode[];
  root: { props: TRootProps };
}

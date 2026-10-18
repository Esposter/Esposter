import type { BlockNode } from "#src/models/BlockNode";

// A document: its content, and its root's props typed by the registry's root schema once a document schema has parsed it
export interface BlockDocument<TRootProps extends Record<string, unknown> = Record<string, unknown>> {
  content: BlockNode[];
  root: { props: TRootProps };
}

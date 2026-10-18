import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRoot } from "#src/models/BlockRoot";

// A document: its content, and its root's props typed by the registry's root schema once a document schema has parsed it
export interface BlockDocument<TRootProps extends Record<string, unknown> = Record<string, unknown>> {
  content: BlockNode[];
  root: BlockRoot<TRootProps>;
}

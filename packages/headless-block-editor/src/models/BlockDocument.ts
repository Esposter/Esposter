import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRoot } from "#src/models/BlockRoot";

export interface BlockDocument {
  content: BlockNode[];
  root: BlockRoot;
}

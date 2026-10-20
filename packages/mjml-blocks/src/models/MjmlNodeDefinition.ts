import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlNode } from "#src/models/MjmlNode";

// The definition of an MJML node: the union of each node type's own definition, so a definition's type tag is paired with the props schema of that type
export type MjmlNodeDefinition<TNode extends MjmlNode = MjmlNode, TContext = unknown> = TNode extends MjmlNode
  ? MjmlBlockTypeDefinition<TNode, TContext>
  : never;

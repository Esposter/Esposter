import type { Node } from "oxc-parser";

// The node each parsed node sits in, kept beside the tree so the nodes keep the parser's own types. Read it with
// `parents.get(node)`, which is undefined for the root; `setParent` is the one place that writes it
export const parents: WeakMap<Node, Node> = new WeakMap<Node, Node>();

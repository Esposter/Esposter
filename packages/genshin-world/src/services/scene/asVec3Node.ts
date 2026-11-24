import type { Node } from "three/webgpu";

// Three types a material's colour, emission and normal nodes as a union of every node type, and its normal map's output
// As untyped, though the stand-ins draw vec3 nodes there, so the node is the vec3 the stand-in drew
export const asVec3Node = (node: Node): Node<"vec3"> =>
  /* oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the stand-ins draw a vec3 node where three types
     the node as any node, so the node is the vec3 the caller names */
  node as Node<"vec3">;

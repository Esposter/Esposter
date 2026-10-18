import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { blockNodeShapeSchema } from "#src/services/blockNodeShapeSchema";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";

// A copy of a node with a fresh id, and a fresh id on every node in its slots, so it shares none with the original
export const remintBlockNode = (registry: BlockRegistry, node: BlockNode): BlockNode => {
  const props: Record<string, unknown> = { ...node.props, id: crypto.randomUUID() };
  for (const slot of Object.keys(getBlockTypeDefinition(registry, node.type)?.slots ?? {})) {
    const children = node.props[slot];
    if (Array.isArray(children))
      props[slot] = children.map((child: unknown) => {
        const result = blockNodeShapeSchema.safeParse(child);
        return result.success ? remintBlockNode(registry, result.data) : child;
      });
  }
  return { props, type: node.type };
};

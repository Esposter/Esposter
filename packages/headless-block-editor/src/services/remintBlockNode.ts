import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { blockNodeShapeSchema } from "#src/services/blockNodeShapeSchema";

// A copy of a node with a fresh id, and a fresh id on every node in its slots, so it shares none with the original
export const remintBlockNode = (registry: BlockRegistry, node: BlockNode): BlockNode => {
  const props: Record<string, unknown> = { ...node.props, id: crypto.randomUUID() };
  for (const slot of Object.keys(registry.find(({ type }) => type === node.type)?.slots ?? {})) {
    const children = node.props[slot];
    if (Array.isArray(children))
      props[slot] = children.map((child: unknown) => {
        const result = blockNodeShapeSchema.safeParse(child);
        return result.success ? remintBlockNode(registry, result.data) : child;
      });
  }
  return { props, type: node.type };
};

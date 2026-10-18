import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";

// Renders each node once its slots have rendered, in the order of the nodes; a node whose type the registry lacks renders nothing
// Each slot the definition names is rendered first, and a slot the node's props do not hold as a list renders empty
export const renderBlockNodes = <TDefinition extends BlockTypeDefinition, TOutput>(
  nodes: BlockNode[],
  registry: BlockRegistry<TDefinition>,
  render: (node: BlockNode, definition: TDefinition, slots: Record<string, TOutput[]>) => TOutput,
): TOutput[] =>
  nodes.flatMap((node) => {
    const definition = getBlockTypeDefinition(registry, node.type);
    if (!definition) return [];

    const slots: Record<string, TOutput[]> = {};
    for (const slot of Object.keys(definition.slots)) {
      const children: unknown = node.props[slot];
      slots[slot] = Array.isArray(children) ? renderBlockNodes(children, registry, render) : [];
    }
    return [render(node, definition, slots)];
  });

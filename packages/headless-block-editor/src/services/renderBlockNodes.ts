import type { BlockNode } from "#src/models/BlockNode";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { getParsedSlotNodes } from "#src/services/getParsedSlotNodes";

// Renders each node once its slots have rendered, in the order of the nodes, and nothing for a node whose type the
// Registry lacks. A slot the node's props do not hold as a list renders empty
export const renderBlockNodes = <TNode extends BlockNode, TDefinition extends BlockTypeDefinition<TNode>, TOutput>(
  nodes: TNode[],
  registry: { types: TDefinition[] },
  render: (node: TNode, definition: TDefinition, slots: Record<string, TOutput[]>) => TOutput,
): TOutput[] =>
  nodes.flatMap((node) => {
    const definition = getBlockTypeDefinition(registry, node.type);
    if (!definition) return [];

    const slots: Record<string, TOutput[]> = {};
    for (const slot of Object.keys(definition.slots))
      slots[slot] = renderBlockNodes(getParsedSlotNodes(node, slot), registry, render);
    return [render(node, definition, slots)];
  });

import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";

// Renders each node once its slots have rendered, in the order of the nodes, and nothing for a node whose type the
// Registry lacks. Each slot's children are read through the port, so a slot the port does not return renders no children
export const renderBlockNodes = <TNode extends BlockNode, TDefinition extends BlockTypeDefinition, TOutput>(
  nodes: readonly TNode[],
  registry: { types: TDefinition[] },
  children: BlockChildren<TNode>,
  render: (node: TNode, definition: TDefinition, slots: Record<string, TOutput[]>) => TOutput,
): TOutput[] =>
  nodes.flatMap((node) => {
    const definition = getBlockTypeDefinition(registry, node.type);
    if (!definition) return [];

    const slots = Object.fromEntries(
      Object.entries(children(node)).map(([slot, slotNodes]) => [
        slot,
        renderBlockNodes(slotNodes, registry, children, render),
      ]),
    );
    return [render(node, definition, slots)];
  });

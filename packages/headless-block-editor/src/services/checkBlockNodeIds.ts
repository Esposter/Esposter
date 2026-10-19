import type { BlockCollection } from "#src/models/BlockCollection";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { z } from "zod";

import { blockNodeShapeSchema } from "#src/services/blockNodeShapeSchema";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";

// Counts each node of a parsed tree and refuses a node whose id an earlier node holds, in any slot, naming the repeated node's id
// The refinement runs past issues the schema already raised, so each child is narrowed from unknown rather than trusted as a node
export const checkBlockNodeIds = (
  context: z.RefinementCtx,
  registry: BlockRegistry,
  nodes: unknown[],
  segments: PropertyKey[],
  collection: BlockCollection,
): void => {
  for (const [index, child] of nodes.entries()) {
    const result = blockNodeShapeSchema.safeParse(child);
    if (!result.success) continue;

    const node = result.data;
    const nodeSegments = [...segments, index];
    collection.count++;

    const { id } = node.props;
    if (typeof id === "string" && collection.ids.has(id))
      context.addIssue({ code: "custom", message: "repeats an id", path: [...nodeSegments, "props", "id"] });
    else if (typeof id === "string") collection.ids.add(id);

    const slots = getBlockTypeDefinition(registry, node.type)?.slots ?? {};
    for (const slot of Object.keys(slots)) {
      const children: unknown = node.props[slot];
      if (Array.isArray(children))
        checkBlockNodeIds(context, registry, children, [...nodeSegments, "props", slot], collection);
    }
  }
};

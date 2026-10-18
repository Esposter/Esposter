import type { BlockCollection } from "#src/models/BlockCollection";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { z } from "zod";

import { blockNodeShapeSchema } from "#src/services/blockNodeShapeSchema";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";

// Refuses each child whose type is not in the registry or not allowed by its slot, and counts the nodes it accepts and their ids
export const checkBlockNodes = (
  context: z.RefinementCtx,
  registry: BlockRegistry,
  children: unknown[],
  acceptedTypes: string[],
  segments: PropertyKey[],
  collection: BlockCollection,
): void => {
  for (const [index, child] of children.entries()) {
    const childSegments = [...segments, index];
    const result = blockNodeShapeSchema.safeParse(child);
    if (!result.success) {
      for (const issue of result.error.issues)
        context.addIssue({ code: "custom", message: issue.message, path: [...childSegments, ...issue.path] });
      continue;
    }

    const { data: node } = result;
    const definition = getBlockTypeDefinition(registry, node.type);
    if (!definition) {
      context.addIssue({ code: "custom", message: `"${node.type}" is not in the registry`, path: childSegments });
      continue;
    } else if (!acceptedTypes.includes(node.type)) {
      context.addIssue({ code: "custom", message: `"${node.type}" is not allowed in this slot`, path: childSegments });
      continue;
    }

    collection.count++;
    const propsResult = definition.propsSchema.safeParse(node.props);
    if (!propsResult.success)
      for (const issue of propsResult.error.issues)
        context.addIssue({ code: "custom", message: issue.message, path: [...childSegments, "props", ...issue.path] });

    const { id } = node.props;
    const idSegments = [...childSegments, "props", "id"];
    if (typeof id !== "string") context.addIssue({ code: "custom", message: "needs a string id", path: idSegments });
    else if (collection.ids.has(id)) context.addIssue({ code: "custom", message: "repeats an id", path: idSegments });
    else collection.ids.add(id);

    for (const [slot, slotTypes] of Object.entries(definition.slots)) {
      const slotSegments = [...childSegments, "props", slot];
      const slotChildren = node.props[slot];
      if (Array.isArray(slotChildren))
        checkBlockNodes(context, registry, slotChildren, slotTypes, slotSegments, collection);
      else context.addIssue({ code: "custom", message: `"${slot}" must hold a list of nodes`, path: slotSegments });
    }
  }
};

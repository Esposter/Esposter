import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { blockNodeShapeSchema } from "#src/services/blockNodeShapeSchema";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { getRootAcceptedTypes } from "#src/services/getRootAcceptedTypes";
import { z } from "zod";

interface BlockCollection {
  count: number;
  ids: Set<string>;
}

const addIssue = (context: z.RefinementCtx, message: string, path: PropertyKey[]): void => {
  context.addIssue({ code: "custom", message, path });
};

// Refuses each child whose type is not in the registry or not allowed by its slot, and counts the nodes it accepts and their ids
const checkBlockNodes = (
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
      for (const issue of result.error.issues) addIssue(context, issue.message, [...childSegments, ...issue.path]);
      continue;
    }

    const { data: node } = result;
    const definition = getBlockTypeDefinition(registry, node.type);
    if (!definition) {
      addIssue(context, `"${node.type}" is not in the registry`, childSegments);
      continue;
    } else if (!acceptedTypes.includes(node.type)) {
      addIssue(context, `"${node.type}" is not allowed in this slot`, childSegments);
      continue;
    }

    collection.count++;
    const propsResult = definition.propsSchema.safeParse(node.props);
    if (!propsResult.success)
      for (const issue of propsResult.error.issues)
        addIssue(context, issue.message, [...childSegments, "props", ...issue.path]);

    const { id } = node.props;
    const idSegments = [...childSegments, "props", "id"];
    if (typeof id !== "string") addIssue(context, "needs a string id", idSegments);
    else if (collection.ids.has(id)) addIssue(context, "repeats an id", idSegments);
    else collection.ids.add(id);

    for (const [slot, slotTypes] of Object.entries(definition.slots)) {
      const slotSegments = [...childSegments, "props", slot];
      const slotChildren = node.props[slot];
      if (Array.isArray(slotChildren))
        checkBlockNodes(context, registry, slotChildren, slotTypes, slotSegments, collection);
      else addIssue(context, `"${slot}" must hold a list of nodes`, slotSegments);
    }
  }
};

// The document's shape, then its registry: every slot holds only the types it allows, ids are unique, and the node count
// Stays within the limit the consumer passes
export const createBlockDocumentSchema = (registry: BlockRegistry, maxNodes: number): z.ZodType<BlockDocument> =>
  z
    .object({ content: z.array(blockNodeShapeSchema), root: z.object({ props: z.record(z.string(), z.unknown()) }) })
    .superRefine((document, context) => {
      const collection: BlockCollection = { count: 0, ids: new Set() };
      checkBlockNodes(context, registry, document.content, getRootAcceptedTypes(registry), ["content"], collection);
      if (collection.count > maxNodes) addIssue(context, `holds more than ${maxNodes} nodes`, ["content"]);
    });

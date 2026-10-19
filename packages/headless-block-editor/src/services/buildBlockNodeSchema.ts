import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { createBlockNodeBranch } from "#src/services/createBlockNodeBranch";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// The union of a node over a sorted list of accepted types, one branch per type, or never for an empty list
export const buildBlockNodeSchema = (
  registry: BlockRegistry,
  acceptedTypes: string[],
  createNodeSchema: (registry: BlockRegistry, acceptedTypes: string[]) => z.ZodType<BlockNode>,
): z.ZodType<BlockNode> => {
  const definitions = acceptedTypes.map((type) => {
    const definition = getBlockTypeDefinition(registry, type);
    if (!definition)
      throw new InvalidOperationError(
        Operation.Create,
        type,
        "is accepted by a slot but has no definition in the registry",
      );
    return definition;
  });
  const [firstDefinition, ...restDefinitions] = definitions;
  if (!firstDefinition) return z.never();

  const typeNames = definitions.map((definition) => definition.type).join(", ");
  return z.discriminatedUnion(
    "type",
    [
      createBlockNodeBranch(registry, firstDefinition, createNodeSchema),
      ...restDefinitions.map((definition) => createBlockNodeBranch(registry, definition, createNodeSchema)),
    ],
    { error: (issue) => (issue.code === "invalid_union" ? `type must be one of ${typeNames}` : undefined) },
  );
};

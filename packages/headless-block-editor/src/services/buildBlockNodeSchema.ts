import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { createBlockNodeBranch } from "#src/services/createBlockNodeBranch";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// The union of a node over a sorted list of accepted types, one branch per type, or never for an empty list
export const buildBlockNodeSchema = <TNode extends BlockNode>(
  registry: BlockRegistry<TNode>,
  acceptedTypes: string[],
  createNodeSchema: (acceptedTypes: string[]) => z.ZodType<TNode>,
): z.ZodType<TNode> => {
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
  // The union is built at runtime from the registry's definitions, so the compiler cannot derive its type from them
  // The registry is typed and each branch is one of its definitions, so the union is the registry's node type: the schema path's one assertion
  // A single assertion is refused (TS2352): the union's output does not overlap a generic TNode, so the cast passes through unknown
  return z.discriminatedUnion(
    "type",
    [
      createBlockNodeBranch(firstDefinition, createNodeSchema),
      ...restDefinitions.map((definition) => createBlockNodeBranch(definition, createNodeSchema)),
    ],
    { error: (issue) => (issue.code === "invalid_union" ? `type must be one of ${typeNames}` : undefined) },
  ) as unknown as z.ZodType<TNode>;
};

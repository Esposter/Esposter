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
  // The branches' output is a loose props object keyed by the consumer's slot and field names, which no generic TNode relates to,
  // So a single assertion is refused (TS2352) and the cast passes through unknown; the union is the registry's node type by construction
  // eslint-disable-next-line no-restricted-syntax -- the union's output is the registry's node type, which the compiler cannot derive from definitions looked up by type name; the cast is on the return expression, where it starts
  return z.discriminatedUnion(
    "type",
    [
      createBlockNodeBranch(firstDefinition, createNodeSchema),
      ...restDefinitions.map((definition) => createBlockNodeBranch(definition, createNodeSchema)),
    ],
    { error: (issue) => (issue.code === "invalid_union" ? `type must be one of ${typeNames}` : undefined) },
  ) as unknown as z.ZodType<TNode>;
};

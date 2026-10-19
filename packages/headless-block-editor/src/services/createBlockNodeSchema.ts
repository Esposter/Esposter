import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

const blockNodeSchemaCaches = new WeakMap<BlockRegistry, Map<string, z.ZodType<BlockNode>>>();

// A branch of a node's union: the type's own props, its id and each slot's children as the same schema over the slot's types
const createBlockNodeBranch = (registry: BlockRegistry, definition: BlockTypeDefinition) => {
  for (const key of ["id", ...Object.keys(definition.slots)])
    if (Object.hasOwn(definition.propsSchema.shape, key))
      throw new InvalidOperationError(
        Operation.Create,
        definition.type,
        `declares a reserved key "${key}" in its props`,
      );

  const slotShapes = Object.fromEntries(
    Object.entries(definition.slots).map(([slot, slotTypes]) => [
      slot,
      z.array(z.lazy(() => createBlockNodeSchema(registry, slotTypes))),
    ]),
  );
  return z.object({
    props: z.strictObject({ ...definition.propsSchema.shape, id: z.string(), ...slotShapes }),
    type: z.literal(definition.type),
  });
};

const buildBlockNodeSchema = (registry: BlockRegistry, acceptedTypes: string[]): z.ZodType<BlockNode> => {
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
      createBlockNodeBranch(registry, firstDefinition),
      ...restDefinitions.map((definition) => createBlockNodeBranch(registry, definition)),
    ],
    { error: (issue) => (issue.code === "invalid_union" ? `type must be one of ${typeNames}` : undefined) },
  );
};

// The schema of a node whose type is one of the accepted types, cached per registry and sorted type list so a recursive slot reuses one schema
export const createBlockNodeSchema = (registry: BlockRegistry, acceptedTypes: string[]): z.ZodType<BlockNode> => {
  const cache = blockNodeSchemaCaches.get(registry) ?? new Map<string, z.ZodType<BlockNode>>();
  blockNodeSchemaCaches.set(registry, cache);

  const sortedTypes = [...new Set(acceptedTypes)].toSorted();
  const key = JSON.stringify(sortedTypes);
  const cachedSchema = cache.get(key);
  if (cachedSchema) return cachedSchema;

  const schema = buildBlockNodeSchema(registry, sortedTypes);
  cache.set(key, schema);
  return schema;
};

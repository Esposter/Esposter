import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// A branch of a node's union: the type's own props, its id and each slot's children as the same schema over the slot's types.
// The node schema is passed in, since a slot's children reach back to it, and importing it would close a cycle
export const createBlockNodeBranch = (
  registry: BlockRegistry,
  definition: BlockTypeDefinition,
  createNodeSchema: (registry: BlockRegistry, acceptedTypes: string[]) => z.ZodType<BlockNode>,
): z.ZodObject<{ props: z.ZodObject<z.core.$ZodLooseShape, z.core.$strict>; type: z.ZodLiteral<string> }> => {
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
      z.array(z.lazy(() => createNodeSchema(registry, slotTypes))),
    ]),
  );
  return z.object({
    props: z.strictObject({ ...definition.propsSchema.shape, id: z.string(), ...slotShapes }),
    type: z.literal(definition.type),
  });
};

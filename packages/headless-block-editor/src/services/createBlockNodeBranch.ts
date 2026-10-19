import type { BlockNode } from "#src/models/BlockNode";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

import { getBlockPropValue } from "#src/services/getBlockPropValue";
import { getSlotTypes } from "#src/services/getSlotTypes";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// A branch of a node's union: the type's own props, its id and each slot's children as the same schema over the slot's types.
// The node schema is passed in, since a slot's children reach back to it, and importing it would close a cycle
export const createBlockNodeBranch = <TNode extends BlockNode>(
  definition: BlockTypeDefinition<TNode>,
  createNodeSchema: (acceptedTypes: string[]) => z.ZodType<TNode>,
): z.ZodObject<{ props: z.ZodObject<z.core.$ZodLooseShape, z.core.$strict>; type: z.ZodLiteral<TNode["type"]> }> => {
  const { propsSchema } = definition;
  if (!(propsSchema instanceof z.ZodObject))
    throw new InvalidOperationError(Operation.Create, definition.type, "declares a props schema that is not an object");

  for (const key of ["id", ...Object.keys(definition.slots)])
    if (Object.hasOwn(propsSchema.shape, key))
      throw new InvalidOperationError(
        Operation.Create,
        definition.type,
        `declares a reserved key "${key}" in its props`,
      );

  const slotShapes = Object.fromEntries(
    Object.keys(definition.slots).map((slot) => [
      slot,
      z.array(z.lazy(() => createNodeSchema(getSlotTypes(definition.slots, slot)))),
    ]),
  );
  // The type's own refinements run over the keys it declares, once the shape passes, so each issue is reported once
  // Zod runs a refinement past a field's issue unless told not to, so the gate is no issue at all
  const declaredKeys = Object.keys(propsSchema.shape);
  const props = z.strictObject({ ...propsSchema.shape, id: z.string(), ...slotShapes }).superRefine(
    (value, context) => {
      const declaredProps = Object.fromEntries(declaredKeys.map((key) => [key, getBlockPropValue(value, key)]));
      for (const { message, path } of propsSchema.safeParse(declaredProps).error?.issues ?? [])
        context.addIssue({ code: "custom", message, path });
    },
    { when: ({ issues }) => issues.length === 0 },
  );
  return z.object({ props, type: z.literal(definition.type) });
};

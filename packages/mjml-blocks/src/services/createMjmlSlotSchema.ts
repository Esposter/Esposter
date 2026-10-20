import { createAcceptedTypesError } from "headless-block-editor";
import { z } from "zod";

// A slot's accepted types as one discriminated union over their branches, refusing a child of another type by naming the types the slot accepts, sorted since the branches are not written in the order the slot lists them
export const createMjmlSlotSchema = <
  TBranches extends [z.ZodObject<{ type: z.ZodLiteral<string> }>, ...z.ZodObject<{ type: z.ZodLiteral<string> }>[]],
>(
  branches: TBranches,
): z.ZodDiscriminatedUnion<TBranches, "type"> =>
  z.discriminatedUnion(
    "type",
    branches,
    createAcceptedTypesError(branches.flatMap((branch) => [...branch.shape.type.values]).toSorted()),
  );

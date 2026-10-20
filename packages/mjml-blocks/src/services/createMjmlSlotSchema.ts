import { z } from "zod";

// A slot's accepted types as one discriminated union over their branches, refusing a child of another type by naming the types the slot accepts
export const createMjmlSlotSchema = <
  TBranches extends [z.ZodObject<{ type: z.ZodLiteral<string> }>, ...z.ZodObject<{ type: z.ZodLiteral<string> }>[]],
>(
  branches: TBranches,
): z.ZodDiscriminatedUnion<TBranches, "type"> => {
  const acceptedTypes = branches
    .flatMap((branch) => [...branch.shape.type.values])
    .toSorted()
    .join(", ");
  return z.discriminatedUnion("type", branches, {
    error: (issue) => (issue.code === "invalid_union" ? `type must be one of ${acceptedTypes}` : undefined),
  });
};

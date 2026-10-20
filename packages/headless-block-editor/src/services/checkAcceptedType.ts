import type { z } from "zod";

// Refuses a node at a path whose type none of the accepted types names, listing the accepted types sorted and each once
export const checkAcceptedType = (
  context: z.RefinementCtx,
  type: string,
  acceptedTypes: readonly string[],
  path: PropertyKey[],
): void => {
  if (acceptedTypes.includes(type)) return;

  context.addIssue({
    code: "custom",
    message: `type must be one of ${[...new Set(acceptedTypes)].toSorted().join(", ")}`,
    path: [...path, "type"],
  });
};

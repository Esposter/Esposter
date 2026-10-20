import type { z } from "zod";

import { getAcceptedTypesMessage } from "#src/services/getAcceptedTypesMessage";

// Refuses a node at a path whose type none of the accepted types names, listing the accepted types as they are given
export const checkAcceptedType = (
  context: z.RefinementCtx,
  type: string,
  acceptedTypes: readonly string[],
  path: PropertyKey[],
): void => {
  if (acceptedTypes.includes(type)) return;

  context.addIssue({ code: "custom", message: getAcceptedTypesMessage(acceptedTypes), path: [...path, "type"] });
};

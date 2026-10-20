import type { z } from "zod";

import { getAcceptedTypesMessage } from "#src/services/getAcceptedTypesMessage";

// The error map of a union that refuses a node whose type none of its branches names, with the same refusal as checkAcceptedType
export const createAcceptedTypesError = (
  acceptedTypes: readonly string[],
): { error: (issue: z.core.$ZodRawIssue) => string | undefined } => ({
  error: (issue: z.core.$ZodRawIssue) =>
    issue.code === "invalid_union" ? getAcceptedTypesMessage(acceptedTypes) : undefined,
});

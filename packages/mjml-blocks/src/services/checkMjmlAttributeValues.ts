import type { z } from "zod";

import { getMjmlAttributeSchema } from "#src/services/getMjmlAttributeSchema";

// Refuses each attribute the grammar table does not take, and each value its grammar refuses, at the path it sits in
export const checkMjmlAttributeValues = (
  values: Record<string, string>,
  allowedAttributes: Record<string, string>,
  segments: PropertyKey[],
  context: z.RefinementCtx,
): void => {
  for (const [name, value] of Object.entries(values)) {
    const path = [...segments, name];
    const schema = getMjmlAttributeSchema(allowedAttributes, name);
    if (schema === undefined) {
      context.addIssue({ code: "custom", message: `"${name}" is not an attribute it takes`, path });
      continue;
    }

    const result = schema.safeParse(value);
    if (!result.success)
      for (const issue of result.error.issues)
        context.addIssue({ code: "custom", message: issue.message, path: [...path, ...issue.path] });
  }
};

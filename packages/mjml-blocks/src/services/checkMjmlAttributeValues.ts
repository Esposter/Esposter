import type { z } from "zod";

import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { parseMjmlAttributeType } from "#src/services/parseMjmlAttributeType";

// Refuses each attribute the grammar table does not take, and each value its grammar refuses, at the path it sits in
export const checkMjmlAttributeValues = (
  values: Record<string, string>,
  allowedAttributes: Record<string, string>,
  segments: PropertyKey[],
  context: z.RefinementCtx,
): void => {
  for (const [name, value] of Object.entries(values)) {
    const path = [...segments, name];
    const grammar = Object.hasOwn(allowedAttributes, name) ? allowedAttributes[name] : undefined;
    if (grammar === undefined) {
      context.addIssue({ code: "custom", message: `"${name}" is not an attribute it takes`, path });
      continue;
    }

    const result = createMjmlAttributeSchema(parseMjmlAttributeType(grammar), name).safeParse(value);
    if (!result.success)
      for (const issue of result.error.issues)
        context.addIssue({ code: "custom", message: issue.message, path: [...path, ...issue.path] });
  }
};

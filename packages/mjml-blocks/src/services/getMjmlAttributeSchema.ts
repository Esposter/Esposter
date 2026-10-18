import type { z } from "zod";

import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";

// The schema of one attribute as its component's table writes its grammar, or undefined when the table does not take the attribute
export const getMjmlAttributeSchema = (
  allowedAttributes: Record<string, string>,
  name: string,
): undefined | z.ZodType<string> => {
  const grammar = Object.hasOwn(allowedAttributes, name) ? allowedAttributes[name] : undefined;
  return grammar === undefined ? undefined : createMjmlAttributeSchema(grammar, name);
};

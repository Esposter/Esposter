import type { z } from "zod";

import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";

// The attribute part of a props schema: each attribute the table takes, optional, as its grammar writes its type
export const createMjmlAttributeShape = (
  allowedAttributes: Record<string, string>,
): Record<string, z.ZodOptional<z.ZodType<string>>> =>
  Object.fromEntries(
    Object.entries(allowedAttributes).map(([name, grammar]): [string, z.ZodOptional<z.ZodType<string>>] => [
      name,
      createMjmlAttributeSchema(grammar, name).optional(),
    ]),
  );

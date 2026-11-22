import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";

import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { typedFromEntries } from "@esposter/shared";

// The attribute part of a props schema: each attribute the table takes, optional, keyed by the table's own keys so the schema keeps them as literal types
export const createMjmlAttributeShape = <TAttributes extends Record<string, string>>(
  allowedAttributes: TAttributes,
): { [K in keyof TAttributes]: MjmlAttributeSchema } =>
  typedFromEntries<{ [K in keyof TAttributes]: MjmlAttributeSchema }>(
    Object.entries<string>(allowedAttributes).map(([name, grammar]) => [
      name,
      createMjmlAttributeSchema(grammar, name).optional(),
    ]),
  );

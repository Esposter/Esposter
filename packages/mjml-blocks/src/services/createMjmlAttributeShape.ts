import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";

import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";

// The attribute part of a props schema: each attribute the table takes, optional, keyed by the table's own keys so the schema keeps them as literal types
export const createMjmlAttributeShape = <TAttributes extends Record<string, string>>(
  allowedAttributes: TAttributes,
): { [K in keyof TAttributes]: MjmlAttributeSchema } => {
  const shape = Object.fromEntries(
    Object.entries<string>(allowedAttributes).map(([name, grammar]) => [
      name,
      createMjmlAttributeSchema(grammar, name).optional(),
    ]),
  );
  // Object.fromEntries cannot name the table's keys, so the shape is asserted to the mapped type of them
  return shape as { [K in keyof TAttributes]: MjmlAttributeSchema };
};

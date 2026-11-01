import type { z } from "zod";

import { allowedAddressSchema } from "#src/services/allowedAddressSchema";
import { checkIsMjmlAddressAttribute } from "#src/services/checkIsMjmlAddressAttribute";
import { createTypeSchema } from "#src/services/createTypeSchema";
import { parseMjmlAttributeType } from "#src/services/parseMjmlAttributeType";

// The schema of one attribute's value as its grammar writes its type, accepting what MJML's validator for that type accepts, and for an address only a scheme that is allowed
export const createMjmlAttributeSchema = (grammar: string, name: string): z.ZodType<string> => {
  const schema = createTypeSchema(parseMjmlAttributeType(grammar));
  return checkIsMjmlAddressAttribute(name) ? schema.and(allowedAddressSchema) : schema;
};

import { checkMjmlAlternativeText } from "#src/services/checkMjmlAlternativeText";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { z } from "zod";

// The props schema of a component that takes alternative text: its attributes, the decorative flag, and a check that one of the two is set
export const createMjmlAlternativeTextPropsSchema = (
  allowedAttributes: Record<string, string>,
): z.ZodObject<{ decorative: z.ZodOptional<z.ZodBoolean> }, z.core.$strict> =>
  z
    .strictObject({ ...createMjmlAttributeShape(allowedAttributes), decorative: z.boolean().optional() })
    .superRefine(checkMjmlAlternativeText);

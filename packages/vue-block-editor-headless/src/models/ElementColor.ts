import { HEX_COLOR_REGEX } from "#src/services/constants";
import { z } from "zod";

// A colour an element draws in, as six hex digits, or "" for none: a shape's fill with none, or an element's colour the page's text colour draws in
export const elementColorSchema: z.ZodUnion<[z.ZodLiteral<"">, z.ZodString]> = z.union([
  z.literal(""),
  z.string().regex(HEX_COLOR_REGEX),
]);

import { Element } from "#src/models/Element";
import { z } from "zod";

// An Elemental Monument's element and whether it is timed, as its place gives them. Either is provisional where the wiki
// Gives neither for the monument's kind, and the place says so until a recording measures it
export interface MonumentPlace {
  element: Element;
  isProvisional: boolean;
  isTimed: boolean;
}

export const monumentPlaceSchema = z.object({
  element: z.enum(Element),
  isProvisional: z.boolean(),
  isTimed: z.boolean(),
}) satisfies z.ZodType<MonumentPlace>;

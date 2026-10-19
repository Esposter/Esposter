import { STYLE_PROPERTY_NAMES } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

// A CSS property the style panel offers, one of the names the constants list in the panel's sector order
export type StyleProperty = (typeof STYLE_PROPERTY_NAMES)[number];

export const stylePropertySchema = z.enum(STYLE_PROPERTY_NAMES) satisfies z.ZodType<StyleProperty>;

import { ALLOWED_URL_SCHEMES, MJML_VALUE_MAX_LENGTH } from "#src/services/constants";
import { checkIsAllowedUrl } from "@esposter/shared";
import { z } from "zod";

// Addresses are checked against the package's allowed schemes, and refused under one message wherever they sit.
// That covers a font's href or an address attribute.
export const allowedAddressSchema: z.ZodString = z
  .string()
  .max(MJML_VALUE_MAX_LENGTH)
  .refine((address) => checkIsAllowedUrl(address, ALLOWED_URL_SCHEMES), {
    error: "has a scheme that is not allowed",
  }) satisfies z.ZodType<string>;

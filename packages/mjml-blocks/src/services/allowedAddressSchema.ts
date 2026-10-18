import { ALLOWED_URL_SCHEMES } from "#src/services/constants";
import { checkIsAllowedUrl } from "@esposter/shared";
import { z } from "zod";

// An address whose scheme the package allows, refused under one message wherever it sits: a font's href or an address attribute
export const allowedAddressSchema = z
  .string()
  .refine((address) => checkIsAllowedUrl(address, ALLOWED_URL_SCHEMES), {
    error: "has a scheme that is not allowed",
  }) satisfies z.ZodType<string>;

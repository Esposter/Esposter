import { checkIsAllowedUrl, DEFAULT_ALLOWED_SCHEMES } from "@esposter/shared";
import { MAX_URL_LENGTH } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

// An address a node may link to or load, refused when its scheme could run a script, such as javascript:
export const webpageUrlSchema = z
  .string()
  .min(1)
  .max(MAX_URL_LENGTH)
  .refine((url) => checkIsAllowedUrl(url, DEFAULT_ALLOWED_SCHEMES), { error: "uses a scheme that is not allowed" });

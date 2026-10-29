import { MAX_PAGE_URL_LENGTH } from "#shared/services/pageBuilder/constants";
import { checkIsAllowedUrl, DEFAULT_ALLOWED_SCHEMES } from "@esposter/shared";
import { z } from "zod";

// A URL a node emits, empty when unset. A javascript: scheme or any other the sanitiser refuses is refused here, so
// No render ever receives one
export const pageUrlSchema = z
  .string()
  .max(MAX_PAGE_URL_LENGTH)
  .refine((url) => checkIsAllowedUrl(url, DEFAULT_ALLOWED_SCHEMES), { error: "URL scheme not allowed" });

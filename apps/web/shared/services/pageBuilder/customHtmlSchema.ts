import { MAX_PAGE_TEXT_LENGTH } from "#shared/services/pageBuilder/constants";
import { sanitizeHtml } from "@esposter/shared";
import { z } from "zod";

// The one raw-HTML prop holds only what the sanitiser returns, so the markup a render emits as it is never carries a
// Script, a handler or a refused URL
export const customHtmlSchema = z
  .string()
  .max(MAX_PAGE_TEXT_LENGTH)
  .transform((html) => sanitizeHtml(html));

import { MJML_CONTENT_MAX_LENGTH } from "#src/services/constants";
import { sanitizeHtml } from "@esposter/shared";
import { z } from "zod";

// Raw HTML a component holds, which the sanitiser must leave unchanged so the email carries the markup its author wrote
export const createMjmlRawContentSchema = (): z.ZodString =>
  z
    .string()
    .max(MJML_CONTENT_MAX_LENGTH)
    .refine((html) => sanitizeHtml(html) === html, { error: "holds HTML the sanitiser would change" });

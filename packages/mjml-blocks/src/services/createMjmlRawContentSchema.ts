import { sanitizeHtml } from "@esposter/shared";
import { z } from "zod";

// Raw HTML a component holds, which the sanitiser must leave unchanged so the email carries the markup its author wrote
export const createMjmlRawContentSchema = (): z.ZodString =>
  z.string().refine((html) => sanitizeHtml(html) === html, { error: "holds HTML the sanitiser would change" });

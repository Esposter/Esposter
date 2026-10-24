import type { emailDocumentSchema } from "#shared/services/pageBuilder/email/emailDocumentSchema";
import type { z } from "zod";

// The document an email holds, as its schema reads it: the MJML root and the body's nodes
export type EmailDocument = z.output<typeof emailDocumentSchema>;

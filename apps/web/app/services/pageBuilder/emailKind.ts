import type { EmailKind } from "@/models/pageBuilder/EmailKind";

import { emailDocumentSchema } from "#shared/services/pageBuilder/email/emailDocumentSchema";
import { emailNodeChildren } from "#shared/services/pageBuilder/email/emailNodeChildren";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";

export const emailKind: EmailKind = {
  children: emailNodeChildren,
  documentSchema: emailDocumentSchema,
  registry: emailRegistry,
};

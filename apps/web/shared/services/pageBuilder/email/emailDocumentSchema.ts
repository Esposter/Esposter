import type { EmailDocument } from "#shared/models/pageBuilder/email/EmailDocument";

import { emailRootPropsSchema } from "#shared/models/pageBuilder/email/EmailRootProps";
import { createPageDocumentSchema } from "#shared/services/pageBuilder/createPageDocumentSchema";
import { EMAIL_BODY_NODE_TYPES } from "#shared/services/pageBuilder/email/constants";
import { emailNodeSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { EmailNodeTypeMap } from "#shared/services/pageBuilder/email/EmailNodeTypeMap";
import { z } from "zod";

export const emailDocumentSchema = createPageDocumentSchema(emailRootPropsSchema, emailNodeSchema, EmailNodeTypeMap, {
  allow: EMAIL_BODY_NODE_TYPES,
}) satisfies z.ZodType<EmailDocument>;

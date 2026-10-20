import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { createMjmlDocumentSchema } from "mjml-blocks";

// An email document, refused on a duplicate id, a node a slot does not allow, props its type refuses, or too many nodes
export const emailDocumentSchema = createMjmlDocumentSchema(emailRegistry, emailBodyChildrenSchema, MAX_EMAIL_NODES);

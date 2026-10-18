import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { createBlockDocumentSchema } from "headless-block-editor";

// An email document, refused on a duplicate id, a node a slot does not allow, props its type refuses, or too many nodes
export const emailDocumentSchema = createBlockDocumentSchema(emailRegistry, MAX_EMAIL_NODES);

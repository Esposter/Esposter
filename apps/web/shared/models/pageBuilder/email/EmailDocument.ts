import type { EmailNode } from "#shared/models/pageBuilder/email/EmailNode";
import type { EmailRootProps } from "#shared/models/pageBuilder/email/EmailRootProps";
import type { PageDocument } from "#shared/models/pageBuilder/PageDocument";

export type EmailDocument = PageDocument<EmailRootProps, EmailNode>;

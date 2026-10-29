import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { createEmailSectionPropsSchema } from "#shared/models/pageBuilder/email/EmailSectionProps";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createPageNode } from "#shared/services/pageBuilder/createPageNode";
import { EmailColumnDefinition } from "#shared/services/pageBuilder/email/column/EmailColumnDefinition";
import { createEmailSectionLayout } from "#shared/services/pageBuilder/email/createEmailSectionLayout";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";
import { getEmailSectionLayoutAttributes } from "#shared/services/pageBuilder/email/getEmailSectionLayoutAttributes";

export const EmailSectionDefinition = {
  createProps: () => ({ ...createEmailSectionLayout(), content: [createPageNode(EmailColumnDefinition)] }),
  createPropsSchema: createEmailSectionPropsSchema,
  render: (props, { content }) =>
    createMjmlElement(ElementTag.MjmlSection, getEmailSectionLayoutAttributes(props), content),
  slots: { content: { allow: [EmailNodeType.Column] } },
  type: EmailNodeType.Section,
} satisfies EmailNodeTypeDefinition<EmailNodeType.Section>;

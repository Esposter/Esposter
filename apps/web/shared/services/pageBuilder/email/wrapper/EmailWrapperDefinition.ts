import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { createEmailWrapperPropsSchema } from "#shared/models/pageBuilder/email/EmailWrapperProps";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createEmailSectionLayout } from "#shared/services/pageBuilder/email/createEmailSectionLayout";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";
import { getEmailSectionLayoutAttributes } from "#shared/services/pageBuilder/email/getEmailSectionLayoutAttributes";

export const EmailWrapperDefinition = {
  createProps: () => ({ ...createEmailSectionLayout(), content: [] }),
  createPropsSchema: createEmailWrapperPropsSchema,
  render: (props, { content }) =>
    createMjmlElement(ElementTag.MjmlWrapper, getEmailSectionLayoutAttributes(props), content),
  slots: { content: { allow: [EmailNodeType.Hero, EmailNodeType.Section] } },
  type: EmailNodeType.Wrapper,
} satisfies EmailNodeTypeDefinition<EmailNodeType.Wrapper>;

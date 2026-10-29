import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { emailCustomHtmlPropsSchema } from "#shared/models/pageBuilder/email/EmailCustomHtmlProps";
import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";
import { createRaw } from "#shared/services/pageBuilder/html/createRaw";

export const EmailCustomHtmlDefinition = {
  createProps: () => ({ html: "" }),
  createPropsSchema: () => emailCustomHtmlPropsSchema,
  render: ({ html }) => createMjmlElement(ElementTag.MjmlRaw, {}, html ? [createRaw(html)] : []),
  slots: {},
  type: EmailNodeType.CustomHtml,
} satisfies EmailNodeTypeDefinition<EmailNodeType.CustomHtml>;

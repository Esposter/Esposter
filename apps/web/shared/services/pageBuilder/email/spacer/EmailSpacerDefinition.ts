import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { emailSpacerPropsSchema } from "#shared/models/pageBuilder/email/EmailSpacerProps";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";

export const EmailSpacerDefinition = {
  createProps: () => ({ height: "20px" }),
  createPropsSchema: () => emailSpacerPropsSchema,
  render: ({ height }) => createMjmlElement(ElementTag.MjmlSpacer, { [ElementAttribute.Height]: height }),
  slots: {},
  type: EmailNodeType.Spacer,
} satisfies EmailNodeTypeDefinition<EmailNodeType.Spacer>;

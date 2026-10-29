import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { createEmailColumnPropsSchema } from "#shared/models/pageBuilder/email/EmailColumnProps";
import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { EmailVerticalAlign } from "#shared/models/pageBuilder/email/EmailVerticalAlign";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { EMAIL_LEAF_NODE_TYPES } from "#shared/services/pageBuilder/email/constants";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";

export const EmailColumnDefinition = {
  createProps: () => ({ backgroundColor: "", content: [], padding: "", verticalAlign: EmailVerticalAlign.Top }),
  createPropsSchema: createEmailColumnPropsSchema,
  render: ({ backgroundColor, padding, verticalAlign }, { content }) =>
    createMjmlElement(
      ElementTag.MjmlColumn,
      {
        [ElementAttribute.BackgroundColor]: backgroundColor,
        [ElementAttribute.Padding]: padding,
        [ElementAttribute.VerticalAlign]: verticalAlign,
      },
      content,
    ),
  slots: { content: { allow: EMAIL_LEAF_NODE_TYPES } },
  type: EmailNodeType.Column,
} satisfies EmailNodeTypeDefinition<EmailNodeType.Column>;

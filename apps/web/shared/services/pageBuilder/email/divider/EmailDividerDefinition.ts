import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import { EmailBorderStyle } from "#shared/models/pageBuilder/email/EmailBorderStyle";
import { emailDividerPropsSchema } from "#shared/models/pageBuilder/email/EmailDividerProps";
import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { MJML_LEAF_PADDING } from "#shared/services/pageBuilder/email/constants";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";

export const EmailDividerDefinition = {
  createProps: () => ({
    align: EmailAlign.Center,
    borderColor: "#000000",
    borderStyle: EmailBorderStyle.Solid,
    borderWidth: "4px",
    padding: MJML_LEAF_PADDING,
    width: "100%",
  }),
  createPropsSchema: () => emailDividerPropsSchema,
  render: ({ align, borderColor, borderStyle, borderWidth, padding, width }) =>
    createMjmlElement(ElementTag.MjmlDivider, {
      [ElementAttribute.Align]: align,
      [ElementAttribute.BorderColor]: borderColor,
      [ElementAttribute.BorderStyle]: borderStyle,
      [ElementAttribute.BorderWidth]: borderWidth,
      [ElementAttribute.Padding]: padding,
      [ElementAttribute.Width]: width,
    }),
  slots: {},
  type: EmailNodeType.Divider,
} satisfies EmailNodeTypeDefinition<EmailNodeType.Divider>;

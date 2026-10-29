import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { emailTextPropsSchema } from "#shared/models/pageBuilder/email/EmailTextProps";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { MJML_FONT_FAMILY, MJML_LEAF_PADDING } from "#shared/services/pageBuilder/email/constants";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";
import { getEmailTypographyAttributes } from "#shared/services/pageBuilder/email/getEmailTypographyAttributes";
import { TEXT_SCHEMA } from "#shared/services/pageBuilder/text/constants";
import { createTextContent } from "#shared/services/pageBuilder/text/createTextContent";
import { renderTextContent } from "#shared/services/pageBuilder/text/renderTextContent";

export const EmailTextDefinition = {
  createProps: () => ({
    align: EmailAlign.Left,
    color: "#000000",
    content: createTextContent(),
    fontFamily: MJML_FONT_FAMILY,
    fontSize: "13px",
    lineHeight: "1",
    padding: MJML_LEAF_PADDING,
  }),
  createPropsSchema: () => emailTextPropsSchema,
  render: ({ align, content, padding, ...typography }) =>
    createMjmlElement(
      ElementTag.MjmlText,
      {
        [ElementAttribute.Align]: align,
        [ElementAttribute.Padding]: padding,
        ...getEmailTypographyAttributes(typography),
      },
      renderTextContent(content, TEXT_SCHEMA),
    ),
  slots: {},
  type: EmailNodeType.Text,
} satisfies EmailNodeTypeDefinition<EmailNodeType.Text>;

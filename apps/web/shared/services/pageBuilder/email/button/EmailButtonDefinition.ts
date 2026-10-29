import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import { emailButtonPropsSchema } from "#shared/models/pageBuilder/email/EmailButtonProps";
import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { MJML_FONT_FAMILY, MJML_LEAF_PADDING } from "#shared/services/pageBuilder/email/constants";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";
import { getEmailLinkTargetAttributes } from "#shared/services/pageBuilder/email/getEmailLinkTargetAttributes";
import { getEmailTypographyAttributes } from "#shared/services/pageBuilder/email/getEmailTypographyAttributes";
import { createText } from "#shared/services/pageBuilder/html/createText";

export const EmailButtonDefinition = {
  createProps: () => ({
    align: EmailAlign.Center,
    backgroundColor: "#414141",
    borderRadius: "3px",
    color: "#ffffff",
    fontFamily: MJML_FONT_FAMILY,
    fontSize: "13px",
    href: "",
    innerPadding: "10px 25px",
    isNewTab: true,
    label: "Button",
    lineHeight: "120%",
    padding: MJML_LEAF_PADDING,
  }),
  createPropsSchema: () => emailButtonPropsSchema,
  render: ({ align, backgroundColor, borderRadius, href, innerPadding, isNewTab, label, padding, ...typography }) =>
    createMjmlElement(
      ElementTag.MjmlButton,
      {
        [ElementAttribute.Align]: align,
        [ElementAttribute.BackgroundColor]: backgroundColor,
        [ElementAttribute.BorderRadius]: borderRadius,
        [ElementAttribute.Href]: href,
        [ElementAttribute.InnerPadding]: innerPadding,
        [ElementAttribute.Padding]: padding,
        ...getEmailLinkTargetAttributes(isNewTab),
        ...getEmailTypographyAttributes(typography),
      },
      [createText(label)],
    ),
  slots: {},
  type: EmailNodeType.Button,
} satisfies EmailNodeTypeDefinition<EmailNodeType.Button>;

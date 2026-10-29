import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { emailNavbarLinkPropsSchema } from "#shared/models/pageBuilder/email/EmailNavbarLinkProps";
import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { MJML_FONT_FAMILY } from "#shared/services/pageBuilder/email/constants";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";
import { getEmailLinkTargetAttributes } from "#shared/services/pageBuilder/email/getEmailLinkTargetAttributes";
import { getEmailTypographyAttributes } from "#shared/services/pageBuilder/email/getEmailTypographyAttributes";
import { createText } from "#shared/services/pageBuilder/html/createText";

export const EmailNavbarLinkDefinition = {
  createProps: () => ({
    color: "#000000",
    fontFamily: MJML_FONT_FAMILY,
    fontSize: "13px",
    href: "",
    isNewTab: true,
    label: "Link",
    lineHeight: "22px",
    padding: "15px 10px",
  }),
  createPropsSchema: () => emailNavbarLinkPropsSchema,
  render: ({ href, isNewTab, label, padding, ...typography }) =>
    createMjmlElement(
      ElementTag.MjmlNavbarLink,
      {
        [ElementAttribute.Href]: href,
        [ElementAttribute.Padding]: padding,
        ...getEmailLinkTargetAttributes(isNewTab),
        ...getEmailTypographyAttributes(typography),
      },
      [createText(label)],
    ),
  slots: {},
  type: EmailNodeType.NavbarLink,
} satisfies EmailNodeTypeDefinition<EmailNodeType.NavbarLink>;

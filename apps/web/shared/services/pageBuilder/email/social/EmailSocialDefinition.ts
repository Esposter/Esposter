import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { EmailSocialMode } from "#shared/models/pageBuilder/email/EmailSocialMode";
import { EmailSocialNetwork } from "#shared/models/pageBuilder/email/EmailSocialNetwork";
import { createEmailSocialPropsSchema } from "#shared/models/pageBuilder/email/EmailSocialProps";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createPageNode } from "#shared/services/pageBuilder/createPageNode";
import { MJML_LEAF_PADDING } from "#shared/services/pageBuilder/email/constants";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";
import { EmailSocialElementDefinition } from "#shared/services/pageBuilder/email/socialElement/EmailSocialElementDefinition";

export const EmailSocialDefinition = {
  createProps: () => ({
    align: EmailAlign.Center,
    content: [EmailSocialNetwork.Facebook, EmailSocialNetwork.X].map((network) =>
      createPageNode(EmailSocialElementDefinition, { network }),
    ),
    iconSize: "20px",
    mode: EmailSocialMode.Horizontal,
    padding: MJML_LEAF_PADDING,
  }),
  createPropsSchema: createEmailSocialPropsSchema,
  render: ({ align, iconSize, mode, padding }, { content }) =>
    createMjmlElement(
      ElementTag.MjmlSocial,
      {
        [ElementAttribute.Align]: align,
        [ElementAttribute.IconSize]: iconSize,
        [ElementAttribute.Mode]: mode,
        [ElementAttribute.Padding]: padding,
      },
      content,
    ),
  slots: { content: { allow: [EmailNodeType.SocialElement] } },
  type: EmailNodeType.Social,
} satisfies EmailNodeTypeDefinition<EmailNodeType.Social>;

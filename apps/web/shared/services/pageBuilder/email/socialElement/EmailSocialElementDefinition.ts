import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { emailSocialElementPropsSchema } from "#shared/models/pageBuilder/email/EmailSocialElementProps";
import { EmailSocialNetwork } from "#shared/models/pageBuilder/email/EmailSocialNetwork";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";
import { createText } from "#shared/services/pageBuilder/html/createText";

export const EmailSocialElementDefinition = {
  createProps: () => ({ href: "", label: "", network: EmailSocialNetwork.Facebook }),
  createPropsSchema: () => emailSocialElementPropsSchema,
  // A network's -noshare form links to the href as it is, where its bare name would wrap it in a share dialog
  render: ({ href, label, network }) =>
    createMjmlElement(
      ElementTag.MjmlSocialElement,
      { [ElementAttribute.Href]: href, [ElementAttribute.Name]: `${network}-noshare` },
      label ? [createText(label)] : [],
    ),
  slots: {},
  type: EmailNodeType.SocialElement,
} satisfies EmailNodeTypeDefinition<EmailNodeType.SocialElement>;

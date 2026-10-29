import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import { createEmailNavbarPropsSchema } from "#shared/models/pageBuilder/email/EmailNavbarProps";
import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createPageNode } from "#shared/services/pageBuilder/createPageNode";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";
import { DEFAULT_NAVBAR_LINK_COUNT } from "#shared/services/pageBuilder/email/navbar/constants";
import { EmailNavbarLinkDefinition } from "#shared/services/pageBuilder/email/navbarLink/EmailNavbarLinkDefinition";

export const EmailNavbarDefinition = {
  createProps: () => ({
    align: EmailAlign.Center,
    content: Array.from({ length: DEFAULT_NAVBAR_LINK_COUNT }, () => createPageNode(EmailNavbarLinkDefinition)),
  }),
  createPropsSchema: createEmailNavbarPropsSchema,
  render: ({ align }, { content }) =>
    createMjmlElement(ElementTag.MjmlNavbar, { [ElementAttribute.Align]: align }, content),
  slots: { content: { allow: [EmailNodeType.NavbarLink] } },
  type: EmailNodeType.Navbar,
} satisfies EmailNodeTypeDefinition<EmailNodeType.Navbar>;

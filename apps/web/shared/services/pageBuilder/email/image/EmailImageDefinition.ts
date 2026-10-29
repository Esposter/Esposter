import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import { emailImagePropsSchema } from "#shared/models/pageBuilder/email/EmailImageProps";
import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { MJML_LEAF_PADDING } from "#shared/services/pageBuilder/email/constants";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";

export const EmailImageDefinition = {
  createProps: () => ({
    align: EmailAlign.Center,
    alt: "",
    borderRadius: "",
    href: "",
    isDecorative: false,
    padding: MJML_LEAF_PADDING,
    src: "",
    width: "",
  }),
  createPropsSchema: () => emailImagePropsSchema,
  // MJML writes an empty alt when it is given none, which is what a decorative image needs
  render: ({ align, alt, borderRadius, href, isDecorative, padding, src, width }) =>
    createMjmlElement(ElementTag.MjmlImage, {
      [ElementAttribute.Align]: align,
      [ElementAttribute.Alt]: isDecorative ? "" : alt,
      [ElementAttribute.BorderRadius]: borderRadius,
      [ElementAttribute.Href]: href,
      [ElementAttribute.Padding]: padding,
      [ElementAttribute.Src]: src,
      [ElementAttribute.Width]: width,
    }),
  slots: {},
  type: EmailNodeType.Image,
} satisfies EmailNodeTypeDefinition<EmailNodeType.Image>;

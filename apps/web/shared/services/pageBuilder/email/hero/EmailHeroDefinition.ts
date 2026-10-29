import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailHeroMode } from "#shared/models/pageBuilder/email/EmailHeroMode";
import { createEmailHeroPropsSchema } from "#shared/models/pageBuilder/email/EmailHeroProps";
import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { EmailVerticalAlign } from "#shared/models/pageBuilder/email/EmailVerticalAlign";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { EMAIL_LEAF_NODE_TYPES } from "#shared/services/pageBuilder/email/constants";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";

export const EmailHeroDefinition = {
  createProps: () => ({
    backgroundColor: "#ffffff",
    backgroundUrl: "",
    content: [],
    height: "0px",
    mode: EmailHeroMode.FixedHeight,
    padding: "0px",
    verticalAlign: EmailVerticalAlign.Top,
  }),
  createPropsSchema: createEmailHeroPropsSchema,
  render: ({ backgroundColor, backgroundUrl, height, mode, padding, verticalAlign }, { content }) =>
    createMjmlElement(
      ElementTag.MjmlHero,
      {
        [ElementAttribute.BackgroundColor]: backgroundColor,
        [ElementAttribute.BackgroundUrl]: backgroundUrl,
        [ElementAttribute.Height]: height,
        [ElementAttribute.Mode]: mode,
        [ElementAttribute.Padding]: padding,
        [ElementAttribute.VerticalAlign]: verticalAlign,
      },
      content,
    ),
  slots: { content: { allow: EMAIL_LEAF_NODE_TYPES } },
  type: EmailNodeType.Hero,
} satisfies EmailNodeTypeDefinition<EmailNodeType.Hero>;

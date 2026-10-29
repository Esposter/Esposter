import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { buttonPropsSchema } from "#shared/models/pageBuilder/webpage/ButtonProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { createText } from "#shared/services/pageBuilder/html/createText";
import { BUTTON_CLASS, BUTTON_CSS } from "#shared/services/pageBuilder/webpage/button/constants";
import { getLinkTargetAttributes } from "#shared/services/pageBuilder/webpage/getLinkTargetAttributes";

export const ButtonDefinition = {
  createProps: () => ({ href: "", isNewTab: false, label: "Button", style: {} }),
  createPropsSchema: () => buttonPropsSchema,
  css: BUTTON_CSS,
  render: ({ href, isNewTab, label }) =>
    createElement(
      ElementTag.Anchor,
      {
        [ElementAttribute.Class]: BUTTON_CLASS,
        [ElementAttribute.Href]: href || undefined,
        ...getLinkTargetAttributes(isNewTab),
      },
      [createText(label)],
    ),
  slots: {},
  type: WebpageNodeType.Button,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Button>;

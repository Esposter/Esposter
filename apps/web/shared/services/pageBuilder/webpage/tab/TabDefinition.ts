import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createTabPropsSchema } from "#shared/models/pageBuilder/webpage/TabProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { WEBPAGE_CONTENT_NODE_TYPES } from "#shared/services/pageBuilder/webpage/constants";
import { getTabId } from "#shared/services/pageBuilder/webpage/tab/getTabId";
import { getTabPanelId } from "#shared/services/pageBuilder/webpage/tab/getTabPanelId";

// A tab renders as its panel; the tab itself is drawn by its Tabs, which owns the tablist
export const TabDefinition = {
  createProps: () => ({ content: [], label: "Tab", style: {} }),
  createPropsSchema: createTabPropsSchema,
  render: ({ id }, { content }) =>
    createElement(
      ElementTag.Division,
      {
        [ElementAttribute.AriaLabelledBy]: getTabId(id),
        [ElementAttribute.Id]: getTabPanelId(id),
        [ElementAttribute.Role]: "tabpanel",
        [ElementAttribute.TabIndex]: "0",
      },
      content,
    ),
  slots: { content: { allow: WEBPAGE_CONTENT_NODE_TYPES } },
  type: WebpageNodeType.Tab,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Tab>;

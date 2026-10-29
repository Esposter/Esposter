import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { HtmlNodeType } from "#shared/models/pageBuilder/html/HtmlNodeType";
import { createTabsPropsSchema } from "#shared/models/pageBuilder/webpage/TabsProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createPageNode } from "#shared/services/pageBuilder/createPageNode";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { createText } from "#shared/services/pageBuilder/html/createText";
import { getTabId } from "#shared/services/pageBuilder/webpage/tab/getTabId";
import { getTabPanelId } from "#shared/services/pageBuilder/webpage/tab/getTabPanelId";
import { TabDefinition } from "#shared/services/pageBuilder/webpage/tab/TabDefinition";
import {
  DEFAULT_TAB_COUNT,
  TABS_CLASS,
  TABS_CSS,
  TABS_SCRIPT,
} from "#shared/services/pageBuilder/webpage/tabs/constants";

export const TabsDefinition = {
  createProps: () => ({
    content: Array.from({ length: DEFAULT_TAB_COUNT }, (_, index) =>
      createPageNode(TabDefinition, { label: `Tab ${index + 1}` }),
    ),
    style: {},
  }),
  createPropsSchema: createTabsPropsSchema,
  css: TABS_CSS,
  // The first tab starts selected and every other panel hidden, so the page reads right before its script runs
  render: ({ content }, slots) =>
    createElement(ElementTag.Division, { [ElementAttribute.Class]: TABS_CLASS }, [
      createElement(
        ElementTag.Division,
        { [ElementAttribute.Role]: "tablist" },
        content.map(({ props }, index) =>
          createElement(
            ElementTag.Button,
            {
              [ElementAttribute.AriaControls]: getTabPanelId(props.id),
              [ElementAttribute.AriaSelected]: String(index === 0),
              [ElementAttribute.Id]: getTabId(props.id),
              [ElementAttribute.Role]: "tab",
              [ElementAttribute.TabIndex]: index === 0 ? "0" : "-1",
              [ElementAttribute.Type]: "button",
            },
            [createText("label" in props ? props.label : "")],
          ),
        ),
      ),
      ...slots.content.map((panel, index) =>
        index === 0 || panel.type !== HtmlNodeType.Element
          ? panel
          : { ...panel, attributes: { ...panel.attributes, [ElementAttribute.Hidden]: "" } },
      ),
    ]),
  script: TABS_SCRIPT,
  slots: { content: { allow: [WebpageNodeType.Tab] } },
  type: WebpageNodeType.Tabs,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Tabs>;

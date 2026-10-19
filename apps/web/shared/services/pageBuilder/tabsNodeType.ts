import type { HtmlElement } from "#shared/models/pageBuilder/HtmlElement";
import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { TabsNode } from "#shared/models/pageBuilder/TabsNode";
import type { TabsNodeProps } from "#shared/models/pageBuilder/TabsNodeProps";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { hidePanel } from "#shared/services/pageBuilder/hidePanel";
import { z } from "zod";

const tabsPropsSchema = z.object({ style: nodeStyleSchema.optional() }) satisfies z.ZodType<OwnProps<TabsNodeProps>>;

// Serialised with toString() and run in the page, so it names nothing outside its own body. Arrow keys move between the
// Tabs and wrap at either end, Home and End move to the first and the last, and a click selects a tab
const tabsScript = () => {
  for (const tablist of window.document.querySelectorAll<HTMLElement>('.tabs > [role="tablist"]')) {
    const tabs = [...tablist.querySelectorAll<HTMLElement>('[role="tab"]')];

    const selectTab = (selected: HTMLElement) => {
      for (const tab of tabs) {
        const isSelected = tab === selected;
        tab.setAttribute("aria-selected", String(isSelected));
        tab.setAttribute("tabindex", isSelected ? "0" : "-1");
        const panel = window.document.getElementById(tab.getAttribute("aria-controls") ?? "");
        if (panel) panel.hidden = !isSelected;
      }
    };

    for (const [index, tab] of tabs.entries()) {
      tab.addEventListener("click", () => {
        selectTab(tab);
      });
      tab.addEventListener("keydown", (event) => {
        let nextIndex: number | undefined;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;

        const next = nextIndex === undefined ? undefined : tabs[nextIndex];
        if (!next) return;

        event.preventDefault();
        selectTab(next);
        next.focus();
      });
    }
  }
};

// A set of tabs, each with its panel, which a reader moves between with the keyboard
export const tabsNodeType = {
  css: `.tabs [role="tablist"] { display: flex; gap: 0.25rem; border-bottom: 1px solid #ccc; }
.tabs [role="tab"] { padding: 0.5rem 1rem; border: 0; background: none; cursor: pointer; }
.tabs [role="tab"][aria-selected="true"] { font-weight: 600; }`,
  formSchema: z.strictObject({}),
  isFocusable: true,
  propsSchema: tabsPropsSchema,
  render: (node, slots) => {
    const buttons = node.props.children.map(({ props: { id, label } }, index): HtmlElement => ({
      attributes: {
        [HtmlAttributeName.AriaControls]: `${id}-panel`,
        [HtmlAttributeName.AriaSelected]: String(index === 0),
        [HtmlAttributeName.Id]: `${id}-tab`,
        [HtmlAttributeName.Role]: "tab",
        [HtmlAttributeName.Tabindex]: index === 0 ? "0" : "-1",
        [HtmlAttributeName.Type]: "button",
      },
      children: [label],
      tag: HtmlTag.Button,
    }));
    const panels = slots.children.map((panel, index) => (index === 0 ? panel : hidePanel(panel)));
    return {
      attributes: { [HtmlAttributeName.Class]: "tabs" },
      children: [
        { attributes: { [HtmlAttributeName.Role]: "tablist" }, children: buttons, tag: HtmlTag.Div },
        ...panels,
      ],
      tag: HtmlTag.Div,
    };
  },
  script: tabsScript,
  slots: { children: [WebpageNodeType.Tab] },
  type: WebpageNodeType.Tabs,
} satisfies NodeTypeDefinition<TabsNode>;

import type { HtmlElement } from "#shared/models/pageBuilder/HtmlElement";
import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";
import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { z } from "zod";

const tabsPropsSchema = z.strictObject({ children: z.array(z.unknown()), id: z.string() });
// Each child is a Tab node, of which the tab button needs only its id and its label
const tabLabelsSchema = z.array(z.object({ props: z.object({ id: z.string(), label: z.string() }) }));

// Every panel but the first starts hidden, as a tab that is not selected does
const hidePanel = (panel: HtmlNode): HtmlNode =>
  typeof panel === "object" && "tag" in panel ? { ...panel, attributes: { ...panel.attributes, hidden: "" } } : panel;

// Serialised with toString() and run in the page, so it names nothing outside its own body. Arrow keys move between the
// Tabs and wrap at either end, Home and End move to the first and the last, and a click selects a tab
const tabsScript = () => {
  for (const tablist of document.querySelectorAll<HTMLElement>('[role="tablist"]')) {
    const tabs = [...tablist.querySelectorAll<HTMLElement>('[role="tab"]')];

    const selectTab = (selected: HTMLElement) => {
      for (const tab of tabs) {
        const isSelected = tab === selected;
        tab.setAttribute("aria-selected", String(isSelected));
        tab.setAttribute("tabindex", isSelected ? "0" : "-1");
        const panel = document.getElementById(tab.getAttribute("aria-controls") ?? "");
        if (panel) panel.hidden = !isSelected;
      }
    };

    tabs.forEach((tab, index) => {
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
    });
  }
};

// A set of tabs, each with its panel, which a reader moves between with the keyboard
export const tabsNodeType = {
  css: `.tabs [role="tablist"] { display: flex; gap: 0.25rem; border-bottom: 1px solid #ccc; }
.tabs [role="tab"] { padding: 0.5rem 1rem; border: 0; background: none; cursor: pointer; }
.tabs [role="tab"][aria-selected="true"] { font-weight: 600; }`,
  formSchema: z.strictObject({}),
  propsSchema: tabsPropsSchema,
  render: (node, slots) => {
    const tabs = tabLabelsSchema.parse(tabsPropsSchema.parse(node.props).children).map(({ props }) => props);
    const buttons = tabs.map(({ id, label }, index): HtmlElement => ({
      attributes: {
        "aria-controls": `${id}-panel`,
        "aria-selected": String(index === 0),
        id: `${id}-tab`,
        role: "tab",
        tabindex: index === 0 ? "0" : "-1",
        type: "button",
      },
      children: [label],
      tag: "button",
    }));
    const panels = (slots.children ?? []).map((panel, index) => (index === 0 ? panel : hidePanel(panel)));
    return {
      attributes: { class: "tabs" },
      children: [{ attributes: { role: "tablist" }, children: buttons, tag: "div" }, ...panels],
      tag: "div",
    };
  },
  script: tabsScript,
  slots: { children: [WebpageNodeType.Tab] },
  type: WebpageNodeType.Tabs,
} satisfies NodeTypeDefinition;

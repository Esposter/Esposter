// @vitest-environment happy-dom
import type { TabNode } from "#shared/models/pageBuilder/TabNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID } from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { tabNodeType } from "#shared/services/pageBuilder/tabNodeType";
import { tabsNodeType } from "#shared/services/pageBuilder/tabsNodeType";
import { afterEach, describe, expect, test } from "vitest";

const createTab = (id: string): TabNode => ({
  props: { children: [], id, label: TEST_LABEL },
  type: WebpageNodeType.Tab,
});

describe("tabsNodeType", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("tabs publish as tabs that move with the arrow keys", () => {
    expect.hasAssertions();

    const tabs = [createTab(TEST_ID), createTab(TEST_OTHER_ID)];
    document.body.innerHTML = serializeHtml([
      tabsNodeType.render(
        { props: { children: tabs, id: "t" }, type: WebpageNodeType.Tabs },
        { children: tabs.map((tab) => tabNodeType.render(tab, { children: [] })) },
      ),
    ]);
    tabsNodeType.script?.();

    const [first, second] = document.querySelectorAll<HTMLElement>("[role=tab]");
    first?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));

    expect({
      focused: document.activeElement?.id,
      hidden: [`${TEST_ID}-panel`, `${TEST_OTHER_ID}-panel`].map((id) => document.getElementById(id)?.hidden),
      selected: [first, second].map((tab) => tab?.getAttribute("aria-selected")),
    }).toStrictEqual({ focused: `${TEST_OTHER_ID}-tab`, hidden: [true, false], selected: ["false", "true"] });
  });

  test("a type's output matches for every edge value", () => {
    expect.hasAssertions();

    // The first tab is selected and every other panel starts hidden; a label is text, so its markup is escaped
    const markupTab: TabNode = { props: { children: [], id: TEST_OTHER_ID, label: "<b>&" }, type: WebpageNodeType.Tab };
    const tabs = [createTab(TEST_ID), markupTab];

    expect([
      serializeHtml([
        tabsNodeType.render({ props: { children: [], id: TEST_ID }, type: WebpageNodeType.Tabs }, { children: [] }),
      ]),
      serializeHtml([
        tabsNodeType.render(
          { props: { children: tabs, id: TEST_ID }, type: WebpageNodeType.Tabs },
          { children: tabs.map((tab) => tabNodeType.render(tab, { children: [] })) },
        ),
      ]),
    ]).toStrictEqual([
      '<div class="tabs"><div role="tablist"></div></div>',
      `<div class="tabs"><div role="tablist"><button aria-controls="${TEST_ID}-panel" aria-selected="true" id="${TEST_ID}-tab" role="tab" tabindex="0" type="button">${TEST_LABEL}</button><button aria-controls="${TEST_OTHER_ID}-panel" aria-selected="false" id="${TEST_OTHER_ID}-tab" role="tab" tabindex="-1" type="button">&lt;b&gt;&amp;</button></div><div aria-labelledby="${TEST_ID}-tab" id="${TEST_ID}-panel" role="tabpanel"></div><div aria-labelledby="${TEST_OTHER_ID}-tab" id="${TEST_OTHER_ID}-panel" role="tabpanel" hidden=""></div></div>`,
    ]);
  });
});

// @vitest-environment happy-dom
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID } from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { tabNodeType } from "#shared/services/pageBuilder/tabNodeType";
import { tabsNodeType } from "#shared/services/pageBuilder/tabsNodeType";
import { afterEach, describe, expect, test } from "vitest";

const createTab = (id: string) => ({ props: { children: [], id, label: TEST_LABEL }, type: WebpageNodeType.Tab });

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
});

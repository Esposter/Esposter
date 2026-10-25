import type { TabNode } from "#shared/models/pageBuilder/TabNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL } from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { tabNodeType } from "#shared/services/pageBuilder/tabNodeType";
import { describe, expect, test } from "vitest";

describe("tabNodeType", () => {
  test("a type's output matches for every edge value", () => {
    expect.hasAssertions();

    const tab: TabNode = { props: { children: [], id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Tab };
    const markup = "<b>&";

    // A panel's label is its tab button's, so only the panel's own children and its links to that button are written
    expect([
      serializeHtml([tabNodeType.render(tab, { children: [] })]),
      serializeHtml([tabNodeType.render(tab, { children: [markup] })]),
    ]).toStrictEqual([
      `<div aria-labelledby="${TEST_ID}-tab" id="${TEST_ID}-panel" role="tabpanel"></div>`,
      `<div aria-labelledby="${TEST_ID}-tab" id="${TEST_ID}-panel" role="tabpanel">&lt;b&gt;&amp;</div>`,
    ]);
  });
});

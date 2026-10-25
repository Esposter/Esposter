import type { TooltipNode } from "#shared/models/pageBuilder/TooltipNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL } from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { tooltipNodeType } from "#shared/services/pageBuilder/tooltipNodeType";
import { describe, expect, test } from "vitest";

describe("tooltipNodeType", () => {
  test("A type's output matches for every edge value", () => {
    expect.hasAssertions();

    // The label and the tooltip are both text, so their markup is escaped where each is written
    const tooltips: TooltipNode[] = [
      { props: { id: TEST_ID, label: TEST_LABEL, text: TEST_LABEL }, type: WebpageNodeType.Tooltip },
      { props: { id: TEST_ID, label: "<b>&", text: "<b>&" }, type: WebpageNodeType.Tooltip },
    ];

    expect(tooltips.map((tooltip) => serializeHtml([tooltipNodeType.render(tooltip)]))).toStrictEqual([
      `<span class="tooltip"><button aria-describedby="${TEST_ID}-tip" type="button">${TEST_LABEL}</button><span id="${TEST_ID}-tip" role="tooltip">${TEST_LABEL}</span></span>`,
      `<span class="tooltip"><button aria-describedby="${TEST_ID}-tip" type="button">&lt;b&gt;&amp;</button><span id="${TEST_ID}-tip" role="tooltip">&lt;b&gt;&amp;</span></span>`,
    ]);
  });
});

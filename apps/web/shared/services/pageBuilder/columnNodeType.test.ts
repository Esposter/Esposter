import type { ColumnNode } from "#shared/models/pageBuilder/ColumnNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { columnNodeType } from "#shared/services/pageBuilder/columnNodeType";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { describe, expect, test } from "vitest";

describe("columnNodeType", () => {
  test("A type's output matches for every edge value", () => {
    expect.hasAssertions();

    const column: ColumnNode = { props: { children: [], id: TEST_ID }, type: WebpageNodeType.Column };
    const markup = "<b>&";

    // A column holds its children as rendered, so markup in a child is escaped the way the child's own text is
    expect([
      serializeHtml([columnNodeType.render(column, { children: [] })]),
      serializeHtml([columnNodeType.render(column, { children: [markup] })]),
    ]).toStrictEqual(['<div class="column"></div>', '<div class="column">&lt;b&gt;&amp;</div>']);
  });
});

import type { ColumnNode } from "#shared/models/pageBuilder/ColumnNode";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { columnNodeType } from "#shared/services/pageBuilder/columnNodeType";
import { columnsNodeType } from "#shared/services/pageBuilder/columnsNodeType";
import {
  TEST_CONTEXT,
  TEST_ID,
  TEST_LABEL,
  TEST_OTHER_ID,
  TEST_ROOT,
  TEST_URL,
} from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { insertBlockNode } from "headless-block-editor";
import { describe, expect, test } from "vitest";

describe("columnsNodeType", () => {
  test("a columns node holds only columns", () => {
    expect.hasAssertions();

    const document: WebpageDocument = {
      content: [
        {
          props: {
            children: [{ props: { children: [], id: TEST_OTHER_ID }, type: WebpageNodeType.Column }],
            id: TEST_ID,
          },
          type: WebpageNodeType.Columns,
        },
      ],
      root: TEST_ROOT,
    };
    const columnsSlot = "/content/0/props/children";
    const newId = crypto.randomUUID();

    expect(
      insertBlockNode(document, webpageRegistry, webpageNodeChildren, columnsSlot, 1, {
        props: { href: TEST_URL, id: newId, label: TEST_LABEL },
        type: WebpageNodeType.Button,
      }),
    ).toStrictEqual([]);
    expect(
      insertBlockNode(document, webpageRegistry, webpageNodeChildren, columnsSlot, 1, {
        props: { children: [], id: newId },
        type: WebpageNodeType.Column,
      }),
    ).toHaveLength(1);
  });

  test("A type's output matches for every edge value", () => {
    expect.hasAssertions();

    const column: ColumnNode = { props: { children: [], id: TEST_OTHER_ID }, type: WebpageNodeType.Column };

    expect([
      serializeHtml([
        columnsNodeType.render(
          { props: { children: [], id: TEST_ID }, type: WebpageNodeType.Columns },
          { children: [] },
          TEST_CONTEXT,
        ),
      ]),
      serializeHtml([
        columnsNodeType.render(
          { props: { children: [column], id: TEST_ID }, type: WebpageNodeType.Columns },
          { children: [columnNodeType.render(column, { children: [] }, TEST_CONTEXT)] },
          TEST_CONTEXT,
        ),
      ]),
    ]).toStrictEqual(['<div class="columns"></div>', '<div class="columns"><div class="column"></div></div>']);
  });
});

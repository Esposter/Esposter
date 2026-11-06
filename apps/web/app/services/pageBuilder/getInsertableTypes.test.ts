// @vitest-environment nuxt
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT, TEST_THIRD_ID } from "#shared/services/pageBuilder/constants.test";
import { TEST_TEXT_CONTENT } from "@/services/pageBuilder/constants.test";
import { getInsertableTypes } from "@/services/pageBuilder/getInsertableTypes";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { describe, expect, test } from "vitest";

describe(getInsertableTypes, () => {
  const TEST_TYPES = [WebpageNodeType.Column, WebpageNodeType.Text, WebpageNodeType.Tab, WebpageNodeType.Section];

  test("An insertion menu offers only the kinds the slot accepts", () => {
    expect.hasAssertions();

    const document: WebpageDocument = {
      content: [
        {
          props: {
            children: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_OTHER_ID }, type: WebpageNodeType.Text }],
            id: TEST_ID,
            tag: HtmlTag.Section,
          },
          type: WebpageNodeType.Section,
        },
      ],
      root: TEST_ROOT,
    };
    const nodePointer = getNodePointer(webpageKind, document, TEST_OTHER_ID);

    expect(getInsertableTypes(webpageKind, document, nodePointer, TEST_TYPES)).toStrictEqual([
      WebpageNodeType.Text,
      WebpageNodeType.Section,
    ]);
  });

  test("A kind no slot accepts here is absent", () => {
    expect.hasAssertions();

    const document: WebpageDocument = {
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_THIRD_ID }, type: WebpageNodeType.Text }],
                  id: TEST_OTHER_ID,
                },
                type: WebpageNodeType.Column,
              },
            ],
            id: TEST_ID,
          },
          type: WebpageNodeType.Columns,
        },
      ],
      root: TEST_ROOT,
    };
    const nodePointer = getNodePointer(webpageKind, document, TEST_OTHER_ID);

    expect(getInsertableTypes(webpageKind, document, nodePointer, TEST_TYPES)).toStrictEqual([WebpageNodeType.Column]);
  });

  test("with nothing selected the page's own content is the slot, which takes no Column", () => {
    expect.hasAssertions();

    const document: WebpageDocument = { content: [], root: TEST_ROOT };

    expect(getInsertableTypes(webpageKind, document, undefined, TEST_TYPES)).toStrictEqual([
      WebpageNodeType.Text,
      WebpageNodeType.Section,
    ]);
  });
});

// @vitest-environment nuxt
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT, TEST_THIRD_ID } from "#shared/services/pageBuilder/constants.test";
import {
  TEST_EMAIL,
  TEST_NESTED_TEXT_ID,
  TEST_SECTION_ID,
  TEST_TEXT_CONTENT,
} from "@/services/pageBuilder/constants.test";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { getInsertableTypes } from "@/services/pageBuilder/getInsertableTypes";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { MjmlNodeType } from "mjml-blocks";
import { describe, expect, test } from "vitest";

describe(getInsertableTypes, () => {
  const TEST_TYPES = [WebpageNodeType.Column, WebpageNodeType.Text, WebpageNodeType.Tab, WebpageNodeType.Section];
  const TEST_EMAIL_TYPES = [MjmlNodeType.Section, MjmlNodeType.Column, MjmlNodeType.Text, MjmlNodeType.Button];

  test("an insertion menu offers only the kinds the slot accepts", () => {
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

  test("a kind no slot accepts here is absent", () => {
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

  test("an insertion menu offers only the kinds the slot accepts in an email column", () => {
    expect.hasAssertions();

    const nodePointer = getNodePointer(emailKind, TEST_EMAIL, TEST_NESTED_TEXT_ID);

    expect(getInsertableTypes(emailKind, TEST_EMAIL, nodePointer, TEST_EMAIL_TYPES)).toStrictEqual([
      MjmlNodeType.Text,
      MjmlNodeType.Button,
    ]);
  });

  test("a section is never offered inside a section", () => {
    expect.hasAssertions();

    const nodePointer = getNodePointer(emailKind, TEST_EMAIL, TEST_OTHER_ID);

    expect(getInsertableTypes(emailKind, TEST_EMAIL, nodePointer, TEST_EMAIL_TYPES)).toStrictEqual([
      MjmlNodeType.Column,
    ]);
  });

  test("a kind no slot accepts here is absent, as a column is at the root of an email", () => {
    expect.hasAssertions();

    const nodePointer = getNodePointer(emailKind, TEST_EMAIL, TEST_SECTION_ID);

    expect(getInsertableTypes(emailKind, TEST_EMAIL, nodePointer, TEST_EMAIL_TYPES)).toStrictEqual([
      MjmlNodeType.Section,
    ]);
  });
});

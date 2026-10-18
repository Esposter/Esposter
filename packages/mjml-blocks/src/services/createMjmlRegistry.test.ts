import type { BlockDocument } from "headless-block-editor";

import {
  TEST_BUTTON_ID,
  TEST_COLUMN_ID,
  TEST_IMAGE_ID,
  TEST_MAX_NODES,
  TEST_REGISTRY,
  TEST_SECTION_ID,
  TEST_TEXT_ID,
} from "#src/services/constants.test";
import { createBlockDocumentSchema, getBlockTypeDefinition } from "headless-block-editor";
import { describe, expect, test } from "vitest";

const getIssuePaths = (document: BlockDocument): PropertyKey[][] =>
  createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES)
    .safeParse(document)
    .error?.issues.map((issue) => issue.path) ?? [];

describe("createMjmlRegistry", () => {
  test("a section accepts only columns and groups", () => {
    expect.hasAssertions();

    expect(
      getIssuePaths({
        content: [
          {
            props: { children: [{ props: { content: "Hi", id: TEST_TEXT_ID }, type: "mj-text" }], id: TEST_SECTION_ID },
            type: "mj-section",
          },
        ],
        root: { props: {} },
      }),
    ).toStrictEqual([["content", 0, "props", "children", 0]]);
  });
  test("a text at the root is refused", () => {
    expect.hasAssertions();

    expect(
      getIssuePaths({
        content: [{ props: { content: "Hi", id: TEST_TEXT_ID }, type: "mj-text" }],
        root: { props: {} },
      }),
    ).toStrictEqual([["content", 0]]);
  });
  test("an attribute value MJML's type refuses", () => {
    expect.hasAssertions();

    expect(
      getIssuePaths({
        content: [
          {
            props: {
              children: [
                {
                  props: {
                    children: [
                      {
                        props: { content: "Go", id: TEST_BUTTON_ID, padding: "1px 2px 3px 4px 5px" },
                        type: "mj-button",
                      },
                    ],
                    id: TEST_COLUMN_ID,
                  },
                  type: "mj-column",
                },
              ],
              id: TEST_SECTION_ID,
            },
            type: "mj-section",
          },
        ],
        root: { props: {} },
      }),
    ).toStrictEqual([["content", 0, "props", "children", 0, "props", "children", 0, "props", "padding"]]);
  });
  test("an image without alternative text is refused", () => {
    expect.hasAssertions();

    expect(
      getIssuePaths({
        content: [
          {
            props: {
              children: [
                {
                  props: {
                    children: [{ props: { id: TEST_IMAGE_ID, src: "https://example.com/a.png" }, type: "mj-image" }],
                    id: TEST_COLUMN_ID,
                  },
                  type: "mj-column",
                },
              ],
              id: TEST_SECTION_ID,
            },
            type: "mj-section",
          },
        ],
        root: { props: {} },
      }),
    ).toStrictEqual([["content", 0, "props", "children", 0, "props", "children", 0, "props", "alt"]]);
  });
  test.each([
    { html: "<p>Hi</p>", isAccepted: true },
    { html: "<p>Hi</p><script>alert(1)</script>", isAccepted: false },
  ])("a raw block accepts $html only when sanitising leaves it unchanged", ({ html, isAccepted }) => {
    expect.hasAssertions();

    const definition = getBlockTypeDefinition(TEST_REGISTRY, "mj-raw");
    expect(definition?.propsSchema.safeParse({ content: html, id: TEST_TEXT_ID }).success).toBe(isAccepted);
  });
});

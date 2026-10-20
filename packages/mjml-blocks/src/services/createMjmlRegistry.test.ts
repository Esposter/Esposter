import { MjmlNodeType } from "#src/models/MjmlNodeType";
import {
  TEST_BUTTON_ID,
  TEST_COLUMN_ID,
  TEST_GROUP_ID,
  TEST_HERO_ID,
  TEST_IMAGE_ID,
  TEST_MAX_NODES,
  TEST_NODE_SCHEMA,
  TEST_REGISTRY,
  TEST_SECTION_ID,
  TEST_TEXT_ID,
  TEST_WRAPPER_ID,
} from "#src/services/constants.test";
import { createMjmlDocumentSchema } from "#src/services/createMjmlDocumentSchema";
import { createMjmlRegistry } from "#src/services/createMjmlRegistry";
import { getBlockTypeDefinition } from "headless-block-editor";
import { describe, expect, test } from "vitest";

// A document as it arrives from its JSON, which the document schema narrows, so its issues name what the schema refused
const getIssuePaths = (document: unknown): PropertyKey[][] =>
  createMjmlDocumentSchema(TEST_REGISTRY, TEST_NODE_SCHEMA, TEST_MAX_NODES)
    .safeParse(document)
    .error?.issues.map((issue) => issue.path) ?? [];

describe(createMjmlRegistry, () => {
  const TEST_ALT_TEXT = "a";
  const TEST_IMAGE_SOURCE = "https://example.com/a.png";

  test("a section accepts only columns and groups", () => {
    expect.hasAssertions();

    expect(
      getIssuePaths({
        content: [
          {
            props: {
              children: [{ props: { content: "", id: TEST_TEXT_ID }, type: MjmlNodeType.Text }],
              id: TEST_SECTION_ID,
            },
            type: MjmlNodeType.Section,
          },
        ],
        root: { props: {} },
      }),
    ).toStrictEqual([["content", 0, "props", "children", 0, "type"]]);
  });

  test("a text at the root is refused", () => {
    expect.hasAssertions();

    expect(
      getIssuePaths({
        content: [{ props: { content: "", id: TEST_TEXT_ID }, type: MjmlNodeType.Text }],
        root: { props: {} },
      }),
    ).toStrictEqual([["content", 0, "type"]]);
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
                        props: { content: "", id: TEST_BUTTON_ID, padding: "1px 2px 3px 4px 5px" },
                        type: MjmlNodeType.Button,
                      },
                    ],
                    id: TEST_COLUMN_ID,
                  },
                  type: MjmlNodeType.Column,
                },
              ],
              id: TEST_SECTION_ID,
            },
            type: MjmlNodeType.Section,
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
                    children: [{ props: { id: TEST_IMAGE_ID, src: TEST_IMAGE_SOURCE }, type: MjmlNodeType.Image }],
                    id: TEST_COLUMN_ID,
                  },
                  type: MjmlNodeType.Column,
                },
              ],
              id: TEST_SECTION_ID,
            },
            type: MjmlNodeType.Section,
          },
        ],
        root: { props: {} },
      }),
    ).toStrictEqual([["content", 0, "props", "children", 0, "props", "children", 0, "props", "alt"]]);
  });

  test("#330 #339 #344 #262 #96 an image's width takes pixels only, and auto is refused", () => {
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
                        props: { alt: TEST_ALT_TEXT, id: TEST_IMAGE_ID, src: TEST_IMAGE_SOURCE, width: "50%" },
                        type: MjmlNodeType.Image,
                      },
                      {
                        props: { alt: TEST_ALT_TEXT, id: TEST_BUTTON_ID, src: TEST_IMAGE_SOURCE, width: "auto" },
                        type: MjmlNodeType.Image,
                      },
                    ],
                    id: TEST_COLUMN_ID,
                  },
                  type: MjmlNodeType.Column,
                },
              ],
              id: TEST_SECTION_ID,
            },
            type: MjmlNodeType.Section,
          },
        ],
        root: { props: {} },
      }),
    ).toStrictEqual([
      ["content", 0, "props", "children", 0, "props", "children", 0, "props", "width"],
      ["content", 0, "props", "children", 0, "props", "children", 1, "props", "width"],
    ]);
  });

  test("#142 #150 #184 #185 #361 a wrapper and a hero are body content, and a group holds columns", () => {
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
                        props: {
                          children: [
                            {
                              props: {
                                children: [{ props: { content: "", id: TEST_TEXT_ID }, type: MjmlNodeType.Text }],
                                id: TEST_COLUMN_ID,
                              },
                              type: MjmlNodeType.Column,
                            },
                          ],
                          id: TEST_GROUP_ID,
                        },
                        type: MjmlNodeType.Group,
                      },
                    ],
                    id: TEST_SECTION_ID,
                  },
                  type: MjmlNodeType.Section,
                },
              ],
              id: TEST_WRAPPER_ID,
            },
            type: MjmlNodeType.Wrapper,
          },
          {
            props: {
              children: [{ props: { content: "", id: crypto.randomUUID() }, type: MjmlNodeType.Text }],
              id: TEST_HERO_ID,
            },
            type: MjmlNodeType.Hero,
          },
        ],
        root: { props: {} },
      }),
    ).toStrictEqual([]);
  });

  test.each([
    { html: "<p>Hi</p>", isAccepted: true },
    { html: "<p>Hi</p><script>alert(1)</script>", isAccepted: false },
  ])("a raw block accepts $html only when sanitising leaves it unchanged", ({ html, isAccepted }) => {
    expect.hasAssertions();

    const definition = getBlockTypeDefinition(TEST_REGISTRY, MjmlNodeType.Raw);
    expect(definition?.propsSchema.safeParse({ content: html }).success).toBe(isAccepted);
  });
});

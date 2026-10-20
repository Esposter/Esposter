import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { TestDocument, TestNode, TestRootProps } from "#src/services/constants.test";

import {
  createTestDocumentSchema,
  TEST_CHILDREN,
  TEST_DOCUMENT,
  TEST_DOCUMENT_NODE_COUNT,
  TEST_HEADING_ID,
  TEST_LIST_ID,
  TEST_NODE_SCHEMA,
  TEST_REGISTRY,
  TEST_SECTION_ID,
  TEST_SECTION_OTHER_ID,
} from "#src/services/constants.test";
import { createBlockDocumentSchema } from "#src/services/createBlockDocumentSchema";
import { describe, expect, expectTypeOf, test } from "vitest";

describe(createBlockDocumentSchema, () => {
  test("a document is typed by its consumer's node schema", () => {
    expect.hasAssertions();

    const schema = createBlockDocumentSchema(
      TEST_REGISTRY,
      TEST_NODE_SCHEMA,
      TEST_REGISTRY.root.propsSchema,
      TEST_CHILDREN,
      TEST_DOCUMENT_NODE_COUNT,
    );

    expectTypeOf(schema.parse(TEST_DOCUMENT)).toEqualTypeOf<TestDocument>();
    expect(schema.parse(TEST_DOCUMENT)).toStrictEqual(TEST_DOCUMENT);
  });

  test("a child its slot does not allow", () => {
    expect.hasAssertions();

    const document: TestDocument = {
      content: [
        {
          props: {
            children: [
              {
                props: { id: TEST_LIST_ID, items: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }] },
                type: "list",
              },
            ],
            id: TEST_SECTION_ID,
            title: "",
          },
          type: "section",
        },
      ],
      root: TEST_DOCUMENT.root,
    };
    const { error, success } = createTestDocumentSchema(TEST_DOCUMENT_NODE_COUNT).safeParse(document);

    expect(success).toBe(false);
    expect(error?.issues.map((issue) => issue.path)).toStrictEqual([
      ["content", 0, "props", "children", 0, "props", "items", 0, "type"],
    ]);
  });

  test("a root holding a type its content does not accept", () => {
    expect.hasAssertions();

    const document: TestDocument = {
      content: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }],
      root: TEST_DOCUMENT.root,
    };
    const { error, success } = createTestDocumentSchema(TEST_DOCUMENT_NODE_COUNT).safeParse(document);

    expect(success).toBe(false);
    expect(error?.issues.map((issue) => issue.path)).toStrictEqual([["content", 0, "type"]]);
  });

  test("root props its schema refuses", () => {
    expect.hasAssertions();

    // The root props are malformed on purpose, so the fixture is the raw JSON a schema checks, not a typed document
    const document: unknown = { content: TEST_DOCUMENT.content, root: { props: {} } };
    const { error, success } = createTestDocumentSchema(TEST_DOCUMENT_NODE_COUNT).safeParse(document);

    expect(success).toBe(false);
    expect(error?.issues.map((issue) => issue.path)).toStrictEqual([["root", "props", "title"]]);
  });

  // The malformed nodes are raw JSON on purpose: a typed document cannot hold the shapes these cases refuse
  test.each<[string, unknown, (number | string)[]]>([
    [
      "a prop its type's schema refuses",
      {
        content: [
          {
            props: {
              children: [{ props: { id: TEST_HEADING_ID, text: 5 }, type: "heading" }],
              id: TEST_SECTION_ID,
              title: "",
            },
            type: "section",
          },
        ],
        root: TEST_DOCUMENT.root,
      },
      ["content", 0, "props", "children", 0, "props", "text"],
    ],
    [
      "a node with no string id",
      {
        content: [
          {
            props: { children: [{ props: { text: "" }, type: "heading" }], id: TEST_SECTION_ID, title: "" },
            type: "section",
          },
        ],
        root: TEST_DOCUMENT.root,
      },
      ["content", 0, "props", "children", 0, "props", "id"],
    ],
    [
      "a slot that is not a list",
      {
        content: [{ props: { children: "", id: TEST_SECTION_ID, title: "" }, type: "section" }],
        root: TEST_DOCUMENT.root,
      },
      ["content", 0, "props", "children"],
    ],
  ])("%s", (_title, document, expectedPath) => {
    expect.hasAssertions();

    const { error, success } = createTestDocumentSchema(TEST_DOCUMENT_NODE_COUNT).safeParse(document);

    expect(success).toBe(false);
    expect(error?.issues.map((issue) => issue.path)).toStrictEqual([expectedPath]);
  });

  test("a document whose registry's root accepts another type is refused", () => {
    expect.hasAssertions();

    const headingRootRegistry: BlockRegistry<TestNode, TestRootProps> = {
      ...TEST_REGISTRY,
      root: { ...TEST_REGISTRY.root, content: ["heading"] },
    };

    expect(
      createBlockDocumentSchema(
        headingRootRegistry,
        TEST_NODE_SCHEMA,
        TEST_REGISTRY.root.propsSchema,
        TEST_CHILDREN,
        TEST_DOCUMENT_NODE_COUNT,
      ).safeParse(TEST_DOCUMENT).success,
    ).toBe(false);
  });

  test("a document past its node limit", () => {
    expect.hasAssertions();

    expect(createTestDocumentSchema(TEST_DOCUMENT_NODE_COUNT - 1).safeParse(TEST_DOCUMENT).success).toBe(false);
    expect(createTestDocumentSchema(TEST_DOCUMENT_NODE_COUNT).safeParse(TEST_DOCUMENT).success).toBe(true);
  });

  test("a repeated id is refused across slots", () => {
    expect.hasAssertions();

    const document: TestDocument = {
      content: [...TEST_DOCUMENT.content, { props: { children: [], id: TEST_HEADING_ID, title: "" }, type: "section" }],
      root: TEST_DOCUMENT.root,
    };
    const { error, success } = createTestDocumentSchema(TEST_DOCUMENT_NODE_COUNT + 1).safeParse(document);

    expect(success).toBe(false);
    expect(error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: "repeats an id", path: ["content", 2, "props", "id"] },
    ]);
  });

  test("a document with a repeated id", () => {
    expect.hasAssertions();

    const document: TestDocument = {
      content: [
        ...TEST_DOCUMENT.content,
        {
          props: {
            children: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }],
            id: TEST_SECTION_OTHER_ID,
            title: "",
          },
          type: "section",
        },
      ],
      root: TEST_DOCUMENT.root,
    };

    expect(createTestDocumentSchema(TEST_DOCUMENT_NODE_COUNT + 2).safeParse(document).success).toBe(false);
  });
});

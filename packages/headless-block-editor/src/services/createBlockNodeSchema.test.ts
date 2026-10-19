import type { BlockRegistry } from "#src/models/BlockRegistry";

import { TEST_HEADING_ID, TEST_LIST_ID, TEST_REGISTRY } from "#src/services/constants.test";
import { createBlockNodeSchema } from "#src/services/createBlockNodeSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(createBlockNodeSchema, () => {
  test("a node of an accepted type parses", () => {
    expect.hasAssertions();

    const heading = { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" };

    expect(createBlockNodeSchema(TEST_REGISTRY, ["heading", "list"]).parse(heading)).toStrictEqual(heading);
  });

  test("a node of a type its slot refuses names its type field", () => {
    expect.hasAssertions();

    const list = { props: { id: TEST_LIST_ID, items: [] }, type: "list" };
    const { error, success } = createBlockNodeSchema(TEST_REGISTRY, ["heading"]).safeParse(list);

    expect(success).toBe(false);
    expect(error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: "type must be one of heading", path: ["type"] },
    ]);
  });

  test("a prop the type does not declare is refused by name", () => {
    expect.hasAssertions();

    const heading = { props: { color: "red", id: TEST_HEADING_ID, text: "" }, type: "heading" };
    const { error, success } = createBlockNodeSchema(TEST_REGISTRY, ["heading"]).safeParse(heading);

    expect(success).toBe(false);
    expect(error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: 'Unrecognized key: "color"', path: ["props"] },
    ]);
  });

  test("a refinement on a type's props is enforced", () => {
    expect.hasAssertions();

    const refinedRegistry: BlockRegistry = {
      root: { content: ["heading"], propsSchema: z.object({}) },
      types: [
        {
          propsSchema: z.object({ text: z.string().min(2) }).superRefine((props, context) => {
            if (props.text !== "ok") context.addIssue({ code: "custom", message: "needs ok", path: ["text"] });
          }),
          slots: {},
          type: "heading",
        },
      ],
    };
    const schema = createBlockNodeSchema(refinedRegistry, ["heading"]);
    const refused = schema.safeParse({ props: { id: TEST_HEADING_ID, text: "no" }, type: "heading" });
    const tooShort = schema.safeParse({ props: { id: TEST_HEADING_ID, text: "a" }, type: "heading" });

    expect(refused.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: "needs ok", path: ["props", "text"] },
    ]);
    // The refinement does not repeat the field's own issue, which is the only one reported
    expect(tooShort.error?.issues.map(({ code, path }) => ({ code, path }))).toStrictEqual([
      { code: "too_small", path: ["props", "text"] },
    ]);
  });

  test("an empty accepted set refuses every child", () => {
    expect.hasAssertions();

    const schema = createBlockNodeSchema(TEST_REGISTRY, []);

    expect(schema.safeParse({ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }).success).toBe(false);
    expect(schema.safeParse({ props: { id: TEST_LIST_ID, items: [] }, type: "list" }).success).toBe(false);
  });

  test("a later call for the same registry and types reuses the schema", () => {
    expect.hasAssertions();

    const schema = createBlockNodeSchema(TEST_REGISTRY, ["heading", "list"]);

    expect(createBlockNodeSchema(TEST_REGISTRY, ["heading", "list"])).toBe(schema);
    expect(createBlockNodeSchema(TEST_REGISTRY, ["list", "heading"])).toBe(schema);
  });

  test("a recursive slot converts without an opaque part", () => {
    expect.hasAssertions();

    const columnRegistry: BlockRegistry = {
      root: { content: ["column"], propsSchema: z.object({}) },
      types: [{ propsSchema: z.object({}), slots: { columns: ["column"] }, type: "column" }],
    };

    expect(
      z.toJSONSchema(createBlockNodeSchema(columnRegistry, ["column"]), { io: "input", target: "draft-2020-12" }),
    ).toStrictEqual({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      oneOf: [
        {
          properties: {
            props: {
              additionalProperties: false,
              properties: { columns: { items: { $ref: "#" }, type: "array" }, id: { type: "string" } },
              required: ["id", "columns"],
              type: "object",
            },
            type: { const: "column", type: "string" },
          },
          required: ["props", "type"],
          type: "object",
        },
      ],
    });
  });

  test("an agent reads the types a slot accepts", () => {
    expect.hasAssertions();

    expect(
      z.toJSONSchema(createBlockNodeSchema(TEST_REGISTRY, ["heading", "list"]), {
        io: "input",
        target: "draft-2020-12",
      }),
    ).toStrictEqual({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      oneOf: [
        {
          properties: {
            props: {
              additionalProperties: false,
              properties: { id: { type: "string" }, text: { type: "string" } },
              required: ["text", "id"],
              type: "object",
            },
            type: { const: "heading", type: "string" },
          },
          required: ["props", "type"],
          type: "object",
        },
        {
          properties: {
            props: {
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                items: {
                  items: {
                    oneOf: [
                      {
                        properties: {
                          props: {
                            additionalProperties: false,
                            properties: { id: { type: "string" }, text: { type: "string" } },
                            required: ["text", "id"],
                            type: "object",
                          },
                          type: { const: "item", type: "string" },
                        },
                        required: ["props", "type"],
                        type: "object",
                      },
                    ],
                  },
                  type: "array",
                },
              },
              required: ["id", "items"],
              type: "object",
            },
            type: { const: "list", type: "string" },
          },
          required: ["props", "type"],
          type: "object",
        },
      ],
    });
  });

  test("a props key that collides with a slot is a registry bug", () => {
    expect.hasAssertions();

    const collidingRegistry: BlockRegistry = {
      root: { content: ["section"], propsSchema: z.object({}) },
      types: [
        { propsSchema: z.object({ children: z.string() }), slots: { children: ["heading"] }, type: "section" },
        { propsSchema: z.object({ text: z.string() }), slots: {}, type: "heading" },
      ],
    };

    expect(() => createBlockNodeSchema(collidingRegistry, ["section"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: section, declares a reserved key "children" in its props]`,
    );
  });
});

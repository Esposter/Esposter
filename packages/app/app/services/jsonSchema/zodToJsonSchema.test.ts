/* oxlint-disable no-new-func */
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";
import { z } from "zod";

interface EvaluatedProps {
  rules: ((value: string) => boolean | string)[];
}

describe(zodToJsonSchema, () => {
  describe("flat object schema", () => {
    test("returns properties, required, and type", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string() });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "name": {
              "title": "Name",
              "type": "string",
            },
          },
          "required": [
            "name",
          ],
          "type": "object",
        }
      `);
    });

    test("generates title from camelCase key when no meta title", () => {
      expect.hasAssertions();

      const schema = z.object({ firstName: z.string() });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "firstName": {
              "title": "First Name",
              "type": "string",
            },
          },
          "required": [
            "firstName",
          ],
          "type": "object",
        }
      `);
    });

    test("preserves meta title over generated title", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string().meta({ title: "Full Name" }) });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "name": {
              "title": "Full Name",
              "type": "string",
            },
          },
          "required": [
            "name",
          ],
          "type": "object",
        }
      `);
    });

    test("prettifies enum-style meta title to spaced title case", () => {
      expect.hasAssertions();

      const schema = z.object({ type: z.string().meta({ title: ColumnTransformationType.ConvertTo }) });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "type": {
              "title": "Convert To",
              "type": "string",
            },
          },
          "required": [
            "type",
          ],
          "type": "object",
        }
      `);
    });

    test("converts anyOf to oneOf within properties", () => {
      expect.hasAssertions();

      const schema = z.object({
        value: z.union([z.literal("").meta({ title: "Empty" }), z.literal(" ").meta({ title: "Space" })]),
      });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "value": {
              "oneOf": [
                {
                  "const": "",
                  "title": "Empty",
                  "type": "string",
                },
                {
                  "const": " ",
                  "title": "Space",
                  "type": "string",
                },
              ],
              "title": "Value",
            },
          },
          "required": [
            "value",
          ],
          "type": "object",
        }
      `);
    });
  });

  describe("discriminated union schema", () => {
    test("returns oneOf instead of properties", () => {
      expect.hasAssertions();

      const schema = z.discriminatedUnion("type", [
        z.object({ name: z.string(), type: z.literal("a") }),
        z.object({ count: z.number(), type: z.literal("b") }),
      ]);
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "oneOf": [
            {
              "additionalProperties": false,
              "properties": {
                "name": {
                  "title": "Name",
                  "type": "string",
                },
                "type": {
                  "const": "a",
                  "title": "Type",
                  "type": "string",
                },
              },
              "required": [
                "name",
                "type",
              ],
              "type": "object",
            },
            {
              "additionalProperties": false,
              "properties": {
                "count": {
                  "title": "Count",
                  "type": "number",
                },
                "type": {
                  "const": "b",
                  "title": "Type",
                  "type": "string",
                },
              },
              "required": [
                "count",
                "type",
              ],
              "type": "object",
            },
          ],
        }
      `);
    });

    test("prettifies enum-style variant root title", () => {
      expect.hasAssertions();

      const schema = z.discriminatedUnion("type", [
        z.object({ type: z.literal("a") }).meta({ title: ColumnTransformationType.ConvertTo }),
        z.object({ type: z.literal("b") }).meta({ title: ColumnTransformationType.DatePart }),
      ]);
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "oneOf": [
            {
              "additionalProperties": false,
              "properties": {
                "type": {
                  "const": "a",
                  "title": "Type",
                  "type": "string",
                },
              },
              "required": [
                "type",
              ],
              "title": "Convert To",
              "type": "object",
            },
            {
              "additionalProperties": false,
              "properties": {
                "type": {
                  "const": "b",
                  "title": "Type",
                  "type": "string",
                },
              },
              "required": [
                "type",
              ],
              "title": "Date Part",
              "type": "object",
            },
          ],
        }
      `);
    });

    test("sets property titles within each variant", () => {
      expect.hasAssertions();

      const schema = z.discriminatedUnion("type", [z.object({ firstName: z.string(), type: z.literal("a") })]);
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "oneOf": [
            {
              "additionalProperties": false,
              "properties": {
                "firstName": {
                  "title": "First Name",
                  "type": "string",
                },
                "type": {
                  "const": "a",
                  "title": "Type",
                  "type": "string",
                },
              },
              "required": [
                "firstName",
                "type",
              ],
              "type": "object",
            },
          ],
        }
      `);
    });
  });

  describe("required fields", () => {
    test("includes required array for non-optional fields", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string(), value: z.number() });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "name": {
              "title": "Name",
              "type": "string",
            },
            "value": {
              "title": "Value",
              "type": "number",
            },
          },
          "required": [
            "name",
            "value",
          ],
          "type": "object",
        }
      `);
    });

    test("omits optional fields from required", () => {
      expect.hasAssertions();

      const schema = z.object({ description: z.string().optional(), name: z.string() });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "description": {
              "title": "Description",
              "type": "string",
            },
            "name": {
              "title": "Name",
              "type": "string",
            },
          },
          "required": [
            "name",
          ],
          "type": "object",
        }
      `);
    });

    test("returns undefined required when all fields are optional", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string().optional() });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "name": {
              "title": "Name",
              "type": "string",
            },
          },
          "type": "object",
        }
      `);
    });
  });

  describe("layout meta properties", () => {
    test("sets layout.comp from meta", () => {
      expect.hasAssertions();

      const schema = z.object({ sourceColumnId: z.string().meta({ comp: "select" }) });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "sourceColumnId": {
              "comp": "select",
              "layout": {
                "comp": "select",
              },
              "title": "Source Column Id",
              "type": "string",
            },
          },
          "required": [
            "sourceColumnId",
          ],
          "type": "object",
        }
      `);
    });

    test("sets layout.getItems from meta", () => {
      expect.hasAssertions();

      const schema = z.object({ sourceColumnId: z.string().meta({ getItems: "context.sourceColumnItems" }) });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "sourceColumnId": {
              "getItems": "context.sourceColumnItems",
              "layout": {
                "getItems": "context.sourceColumnItems",
              },
              "title": "Source Column Id",
              "type": "string",
            },
          },
          "required": [
            "sourceColumnId",
          ],
          "type": "object",
        }
      `);
    });

    test("sets layout.getProps from meta", () => {
      expect.hasAssertions();

      const getProps = `{ rules: [(value) => !context.columnNames.includes(value) || 'Column already exists'] }`;
      const schema = z.object({ name: z.string().meta({ getProps }) });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "name": {
              "getProps": "{ rules: [(value) => !context.columnNames.includes(value) || 'Column already exists'] }",
              "layout": {
                "getProps": "{ rules: [(value) => !context.columnNames.includes(value) || 'Column already exists'] }",
              },
              "title": "Name",
              "type": "string",
            },
          },
          "required": [
            "name",
          ],
          "type": "object",
        }
      `);
    });

    test("sets all layout properties when multiple meta are provided", () => {
      expect.hasAssertions();

      const schema = z.object({
        sourceColumnId: z.string().meta({ comp: "select", getItems: "context.sourceColumnItems" }),
      });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "sourceColumnId": {
              "comp": "select",
              "getItems": "context.sourceColumnItems",
              "layout": {
                "comp": "select",
                "getItems": "context.sourceColumnItems",
              },
              "title": "Source Column Id",
              "type": "string",
            },
          },
          "required": [
            "sourceColumnId",
          ],
          "type": "object",
        }
      `);
    });

    test("does not set layout when no layout meta are provided", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string().meta({ title: "Name" }) });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchInlineSnapshot(`
        {
          "additionalProperties": false,
          "properties": {
            "name": {
              "title": "Name",
              "type": "string",
            },
          },
          "required": [
            "name",
          ],
          "type": "object",
        }
      `);
    });

    test("getProps string evaluates to different rules when context changes", () => {
      expect.hasAssertions();

      const getPropsStr = `{ rules: [(value) => !context.columnNames.includes(value) || 'Column already exists'] }`;
      const schema = z.object({ name: z.string().meta({ getProps: getPropsStr }) });
      const result = zodToJsonSchema(schema) as { properties: Record<string, { layout?: { getProps?: string } }> };
      const storedGetProps = result.properties.name?.layout?.getProps;
      assert.exists(storedGetProps);
      const evaluate = (columnNames: string[]): EvaluatedProps =>
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        new Function("context", `return ${storedGetProps}`)({ columnNames }) as EvaluatedProps;
      const withEmpty = evaluate([""]);

      expect(takeOne(withEmpty.rules, 0)("")).toBe("Column already exists");
      expect(takeOne(withEmpty.rules, 0)(" ")).toBe(true);

      const withSpace = evaluate([" "]);

      expect(takeOne(withSpace.rules, 0)("")).toBe(true);
      expect(takeOne(withSpace.rules, 0)(" ")).toBe("Column already exists");
    });
  });
});

/* oxlint-disable no-new-func */
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { ColumnFormVjsfContextPropertyNames } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import { uniqueColumnNameKeywordDefinition } from "@/services/ajv/keywords/uniqueColumnNameKeywordDefinition";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(zodToJsonSchema, () => {
  describe("flat object schema", () => {
    test("generates additionalProperties false", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string() });
      const result = zodToJsonSchema(schema);

      expect(result.additionalProperties).toBe(false);
    });

    test("generates title from camelCase key when no meta title", () => {
      expect.hasAssertions();

      const schema = z.object({ firstName: z.string() });
      const result = zodToJsonSchema(schema);

      expect(result.properties?.firstName).toHaveProperty("title", "First Name");
    });

    test("preserves meta title over generated title", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string().meta({ title: "Full Name" }) });
      const result = zodToJsonSchema(schema);

      expect(result.properties?.name).toHaveProperty("title", "Full Name");
    });

    test("prettifies enum-style meta title to spaced title case", () => {
      expect.hasAssertions();

      const schema = z.object({ type: z.string().meta({ title: ColumnTransformationType.ConvertTo }) });
      const result = zodToJsonSchema(schema);

      expect(result.properties?.type).toHaveProperty("title", "Convert To");
    });

    test("converts anyOf to oneOf within properties", () => {
      expect.hasAssertions();

      const schema = z.object({
        value: z.union([z.literal("").meta({ title: "Empty" }), z.literal(" ").meta({ title: "Space" })]),
      });
      const result = zodToJsonSchema(schema);

      expect(result.properties?.value).toMatchInlineSnapshot(`
        {
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
        }
      `);
    });
  });

  describe("discriminated union schema", () => {
    test("adds discriminator with propertyName", () => {
      expect.hasAssertions();

      const schema = z.discriminatedUnion("type", [
        z.object({ name: z.string(), type: z.literal("a") }),
        z.object({ count: z.number(), type: z.literal("b") }),
      ]);
      const result = zodToJsonSchema(schema);

      expect(result.discriminator).toStrictEqual({ propertyName: "type" });
    });

    test("returns oneOf instead of properties", () => {
      expect.hasAssertions();

      const schema = z.discriminatedUnion("type", [
        z.object({ name: z.string(), type: z.literal("a") }),
        z.object({ count: z.number(), type: z.literal("b") }),
      ]);
      const result = zodToJsonSchema(schema);

      expect(result).toHaveProperty("oneOf");
      expect(result).not.toHaveProperty("properties");
    });

    test("prettifies enum-style variant root title", () => {
      expect.hasAssertions();

      const schema = z.discriminatedUnion("type", [
        z.object({ type: z.literal("a") }).meta({ title: ColumnTransformationType.ConvertTo }),
        z.object({ type: z.literal("b") }).meta({ title: ColumnTransformationType.DatePart }),
      ]);
      const result = zodToJsonSchema(schema);

      expect(result.oneOf).toMatchInlineSnapshot(`
        [
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
        ]
      `);
    });

    test("sets property titles within each variant", () => {
      expect.hasAssertions();

      const schema = z.discriminatedUnion("type", [z.object({ firstName: z.string(), type: z.literal("a") })]);
      const result = zodToJsonSchema(schema);

      expect(result.oneOf).toMatchInlineSnapshot(`
        [
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
        ]
      `);
    });
  });

  describe("required fields", () => {
    test("includes required array for non-optional fields", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string(), value: z.number() });
      const result = zodToJsonSchema(schema);

      expect(result.required).toStrictEqual(["name", "value"]);
    });

    test("omits optional fields from required", () => {
      expect.hasAssertions();

      const schema = z.object({ description: z.string().optional(), name: z.string() });
      const result = zodToJsonSchema(schema);

      expect(result.required).toStrictEqual(["name"]);
    });

    test("returns undefined required when all fields are optional", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string().optional() });
      const result = zodToJsonSchema(schema);

      expect(result.required).toBeUndefined();
    });
  });

  describe("layout meta properties", () => {
    test("sets layout.comp from meta", () => {
      expect.hasAssertions();

      const schema = z.object({ sourceColumnId: z.string().meta({ layout: { comp: "select" } }) });
      const result = zodToJsonSchema(schema);

      expect(result.properties?.sourceColumnId).toMatchInlineSnapshot(`
        {
          "layout": {
            "comp": "select",
          },
          "title": "Source Column Id",
          "type": "string",
        }
      `);
    });

    test("sets layout.getItems from meta", () => {
      expect.hasAssertions();

      const schema = z.object({
        sourceColumnId: z
          .string()
          .meta({ layout: { getItems: ColumnFormVjsfContextPropertyNames["context.columnItems"] } }),
      });
      const result = zodToJsonSchema(schema);

      expect(result.properties?.sourceColumnId).toMatchInlineSnapshot(`
        {
          "layout": {
            "getItems": "context.columnItems",
          },
          "title": "Source Column Id",
          "type": "string",
        }
      `);
    });

    test("sets layout.getProps from meta", () => {
      expect.hasAssertions();

      const getProps = `{ rules: [(value) => !context.columnNames.includes(value) || 'Column already exists'] }`;
      const schema = z.object({ name: z.string().meta({ layout: { getProps } }) });
      const result = zodToJsonSchema(schema);

      expect(result.properties?.name).toMatchInlineSnapshot(`
        {
          "layout": {
            "getProps": "{ rules: [(value) => !context.columnNames.includes(value) || 'Column already exists'] }",
          },
          "title": "Name",
          "type": "string",
        }
      `);
    });

    test("sets all layout properties when multiple are provided", () => {
      expect.hasAssertions();

      const schema = z.object({
        sourceColumnId: z
          .string()
          .meta({ layout: { comp: "select", getItems: ColumnFormVjsfContextPropertyNames["context.columnItems"] } }),
      });
      const result = zodToJsonSchema(schema);

      expect(result.properties?.sourceColumnId).toMatchInlineSnapshot(`
        {
          "layout": {
            "comp": "select",
            "getItems": "context.columnItems",
          },
          "title": "Source Column Id",
          "type": "string",
        }
      `);
    });

    test("does not set layout when no layout meta are provided", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string().meta({ title: "Name" }) });
      const result = zodToJsonSchema(schema);

      expect(result.properties?.name).not.toHaveProperty("layout");
    });

    describe(`${uniqueColumnNameKeywordDefinition.keyword} meta property`, () => {
      test(`sets ${uniqueColumnNameKeywordDefinition.keyword} and auto-generates errorMessage`, () => {
        expect.hasAssertions();

        const schema = z.object({ name: z.string().meta({ [uniqueColumnNameKeywordDefinition.keyword]: true }) });
        const result = zodToJsonSchema(schema);

        expect(result.properties?.name).toMatchInlineSnapshot(`
        {
          "errorMessage": {
            "uniqueColumnName": "Column already exists",
          },
          "title": "Name",
          "type": "string",
          "uniqueColumnName": true,
        }
      `);
      });
    });
  });
});

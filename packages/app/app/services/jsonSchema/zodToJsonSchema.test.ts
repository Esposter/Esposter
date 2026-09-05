import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { ColumnFormVjsfContextPropertyNames } from "@/models/resource/sheet/column/ColumnFormVjsfContext";
import { uniqueColumnNameKeywordDefinition } from "@/services/ajv/keywords/uniqueColumnNameKeywordDefinition";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(zodToJsonSchema, () => {
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

  test("names the discriminator and branches into oneOf instead of properties", () => {
    expect.hasAssertions();

    const result = zodToJsonSchema(
      z.discriminatedUnion("type", [
        z.object({ name: z.string(), type: z.literal("a") }),
        z.object({ count: z.number(), type: z.literal("b") }),
      ]),
    );

    expect(result.discriminator).toStrictEqual({ propertyName: "type" });
    expect(result).toHaveProperty("oneOf");
    expect(result).not.toHaveProperty("properties");
  });

  // The column form nests one under `transformation`, and vjsf only renders the sub-form it offers if the
  // Discriminator and the titles survive the descent as well as they do at the root
  test("carries the discriminator and the generated titles into a nested union", () => {
    expect.hasAssertions();

    const result = zodToJsonSchema(
      z.object({
        sourceName: z.string().meta({ readOnly: true }).default(""),
        transformation: z.discriminatedUnion("type", [
          z.object({ sourceColumnId: z.string(), type: z.literal("a") }).meta({ title: "A" }),
        ]),
      }),
    );

    expect(result.properties?.transformation).toMatchInlineSnapshot(`
      {
        "discriminator": {
          "propertyName": "type",
        },
        "oneOf": [
          {
            "additionalProperties": false,
            "properties": {
              "sourceColumnId": {
                "title": "Source Column Id",
                "type": "string",
              },
              "type": {
                "const": "a",
                "title": "Type",
                "type": "string",
              },
            },
            "required": [
              "sourceColumnId",
              "type",
            ],
            "title": "A",
            "type": "object",
          },
        ],
        "title": "Transformation",
      }
    `);
    expect(result.properties?.sourceName).toMatchInlineSnapshot(`
      {
        "default": "",
        "readOnly": true,
        "title": "Source Name",
        "type": "string",
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

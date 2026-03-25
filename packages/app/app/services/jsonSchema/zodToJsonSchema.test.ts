import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
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

      expect(result).toMatchObject({
        properties: expect.objectContaining({ name: expect.any(Object) }),
        required: expect.arrayContaining(["name"]),
        type: "object",
      });
    });

    test("generates title from camelCase key when no meta title", () => {
      expect.hasAssertions();

      const schema = z.object({ firstName: z.string() });
      const result = zodToJsonSchema(schema) as { properties: Record<string, { title?: string }> };

      expect(result.properties.firstName?.title).toBe(toTitleCase(prettify("firstName")));
    });

    test("preserves meta title over generated title", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string().meta({ title: "Full Name" }) });
      const result = zodToJsonSchema(schema) as { properties: Record<string, { title?: string }> };

      expect(result.properties.name?.title).toBe("Full Name");
    });

    test("prettifies enum-style meta title to spaced title case", () => {
      expect.hasAssertions();

      const schema = z.object({ type: z.string().meta({ title: ColumnTransformationType.ConvertTo }) });
      const result = zodToJsonSchema(schema) as { properties: Record<string, { title?: string }> };

      expect(result.properties.type?.title).toBe(toTitleCase(prettify(ColumnTransformationType.ConvertTo)));
    });

    test("converts anyOf to oneOf within properties", () => {
      expect.hasAssertions();

      const schema = z.object({
        value: z.union([z.literal("").meta({ title: "Empty" }), z.literal(" ").meta({ title: "Space" })]),
      });
      const result = zodToJsonSchema(schema) as { properties: Record<string, Record<string, unknown>> };

      expect(result.properties.value).toHaveProperty("oneOf");
      expect(result.properties.value).not.toHaveProperty("anyOf");
    });

    test("removes const from literal properties", () => {
      expect.hasAssertions();

      const schema = z.object({ type: z.literal("a") });
      const result = zodToJsonSchema(schema) as { properties: Record<string, Record<string, unknown>> };

      expect(result.properties.type).not.toHaveProperty("const");
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

      expect(result).toHaveProperty("oneOf");
      expect(result).not.toHaveProperty("properties");
    });

    test("prettifies enum-style variant root title", () => {
      expect.hasAssertions();

      const schema = z.discriminatedUnion("type", [
        z.object({ type: z.literal("a") }).meta({ title: ColumnTransformationType.ConvertTo }),
        z.object({ type: z.literal("b") }).meta({ title: ColumnTransformationType.DatePart }),
      ]);
      const result = zodToJsonSchema(schema) as { oneOf: { title?: string }[] };

      expect(takeOne(result.oneOf, 0).title).toBe(toTitleCase(prettify(ColumnTransformationType.ConvertTo)));
      expect(takeOne(result.oneOf, 1).title).toBe(toTitleCase(prettify(ColumnTransformationType.DatePart)));
    });

    test("sets property titles within each variant", () => {
      expect.hasAssertions();

      const schema = z.discriminatedUnion("type", [z.object({ firstName: z.string(), type: z.literal("a") })]);
      const result = zodToJsonSchema(schema) as {
        oneOf: { properties: Record<string, { title?: string }> }[];
      };

      expect(takeOne(result.oneOf, 0).properties.firstName?.title).toBe(toTitleCase(prettify("firstName")));
    });
  });

  describe("required fields", () => {
    test("includes required array for non-optional fields", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string(), value: z.number() });
      const result = zodToJsonSchema(schema);

      expect(result.required).toStrictEqual(expect.arrayContaining(["name", "value"]));
    });

    test("omits optional fields from required", () => {
      expect.hasAssertions();

      const schema = z.object({ description: z.string().optional(), name: z.string() });
      const result = zodToJsonSchema(schema);

      expect(result.required).toContain("name");
      expect(result.required).not.toContain("description");
    });

    test("returns undefined required when all fields are optional", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string().optional() });
      const result = zodToJsonSchema(schema);

      expect(result.required === undefined || result.required?.length === 0).toBe(true);
    });
  });

  describe("layout meta properties", () => {
    test("sets layout.comp from meta", () => {
      expect.hasAssertions();

      const schema = z.object({ sourceColumnId: z.string().meta({ comp: "select" }) });
      const result = zodToJsonSchema(schema) as { properties: Record<string, { layout?: Record<string, unknown> }> };

      expect(result.properties.sourceColumnId?.layout?.comp).toBe("select");
    });

    test("sets layout.getItems from meta", () => {
      expect.hasAssertions();

      const schema = z.object({ sourceColumnId: z.string().meta({ getItems: "context.sourceColumnItems" }) });
      const result = zodToJsonSchema(schema) as { properties: Record<string, { layout?: Record<string, unknown> }> };

      expect(result.properties.sourceColumnId?.layout?.getItems).toBe("context.sourceColumnItems");
    });

    test("sets layout.getProps from meta", () => {
      expect.hasAssertions();

      const getProps = `{ rules: [(value) => !context.columnNames.includes(value) || 'Column already exists'] }`;
      const schema = z.object({ name: z.string().meta({ getProps }) });
      const result = zodToJsonSchema(schema) as { properties: Record<string, { layout?: Record<string, unknown> }> };

      expect(result.properties.name?.layout?.getProps).toBe(getProps);
    });

    test("sets all layout properties when multiple meta are provided", () => {
      expect.hasAssertions();

      const schema = z.object({
        sourceColumnId: z.string().meta({ comp: "select", getItems: "context.sourceColumnItems" }),
      });
      const result = zodToJsonSchema(schema) as { properties: Record<string, { layout?: Record<string, unknown> }> };

      expect(result.properties.sourceColumnId?.layout).toStrictEqual({
        comp: "select",
        getItems: "context.sourceColumnItems",
      });
    });

    test("does not set layout when no layout meta are provided", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string().meta({ title: "Name" }) });
      const result = zodToJsonSchema(schema) as { properties: Record<string, { layout?: Record<string, unknown> }> };

      expect(result.properties.name?.layout).toBeUndefined();
    });

    test("getProps string evaluates to different rules when context changes", () => {
      expect.hasAssertions();

      const getPropsStr = `{ rules: [(value) => !context.columnNames.includes(value) || 'Column already exists'] }`;
      const schema = z.object({ name: z.string().meta({ getProps: getPropsStr }) });
      const result = zodToJsonSchema(schema) as { properties: Record<string, { layout?: { getProps?: string } }> };
      const storedGetProps = result.properties.name?.layout?.getProps ?? "";
      const evaluate = (columnNames: string[]): EvaluatedProps =>
        // oxlint-disable-next-line @typescript-eslint/no-implied-eval
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

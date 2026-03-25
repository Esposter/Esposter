import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { z } from "zod";

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

      expect(result.properties.firstName?.title).toBe("First Name");
    });

    test("preserves meta title over generated title", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string().meta({ title: "Full Name" }) });
      const result = zodToJsonSchema(schema) as { properties: Record<string, { title?: string }> };

      expect(result.properties.name?.title).toBe("Full Name");
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

      type EvaluatedProps = { rules: ((value: string) => boolean | string)[] };

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

import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(zodToJsonSchema, () => {
  describe("flat object schema", () => {
    test("returns properties and type", () => {
      expect.hasAssertions();

      const schema = z.object({ name: z.string() });
      const result = zodToJsonSchema(schema);

      expect(result).toMatchObject({
        properties: expect.objectContaining({ name: expect.any(Object) }),
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

      const schema = z.object({ type: z.literal("") });
      const result = zodToJsonSchema(schema) as { properties: Record<string, Record<string, unknown>> };

      expect(result.properties.type).not.toHaveProperty("const");
    });
  });
});

import { checkIsAgentWritablePath } from "#server/services/mcp/checkIsAgentWritablePath";
import { getAgentJsonSchema } from "#server/services/mcp/getAgentJsonSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(checkIsAgentWritablePath, () => {
  const treeNodeSchema = z.object({
    get children() {
      return z.array(treeNodeSchema);
    },
    data: z.unknown(),
    name: z.string(),
  });
  const jsonSchema = getAgentJsonSchema(
    z.object({
      data: z.record(z.string(), z.unknown()),
      id: z.string().meta({ readOnly: true }),
      items: z.array(z.object({ type: z.literal("a").readonly(), value: z.string() })),
      name: z.string(),
      tree: treeNodeSchema,
      union: z.union([z.object({ value: z.string() }), z.object({ value: z.unknown() })]),
    }),
  );

  test.each([
    ["the root", ""],
    ["a described field", "/name"],
    ["a record holding undescribed values", "/data"],
    ["an array's appended item", "/items/-"],
    ["an array's item", "/items/0"],
    ["an item's described field", "/items/0/value"],
    ["a recursive node's described field", "/tree/children/0/children/0/name"],
    // Whatever the schema does not name is the save's parse to strip or refuse, as for any other caller
    ["a key the schema does not name", "/missing"],
  ])("allows %s", (_title, pointer) => {
    expect.hasAssertions();

    expect(checkIsAgentWritablePath(jsonSchema, pointer)).toBe(true);
  });

  test.each([
    ["a read-only field", "/id"],
    ["under a read-only field", "/id/0"],
    ["a record's undescribed value", "/data/a"],
    ["under an undescribed value", "/data/a/b"],
    ["an item's read-only field", "/items/0/type"],
    ["an appended item's read-only field", "/items/-/type"],
    ["a field one union branch leaves undescribed", "/union/value"],
    ["a recursive node's undescribed field", "/tree/children/0/data"],
  ])("refuses %s", (_title, pointer) => {
    expect.hasAssertions();

    expect(checkIsAgentWritablePath(jsonSchema, pointer)).toBe(false);
  });
});

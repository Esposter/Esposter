import { createGetResourceLinkTargets } from "#server/services/resource/link/createGetResourceLinkTargets";
import { createResourceLinkSchema } from "#shared/services/resource/link/createResourceLinkSchema";
import { ResourceLinkType } from "@esposter/db-schema";
import { assert, describe, expect, test } from "vitest";
import { z } from "zod";

describe(createGetResourceLinkTargets, () => {
  const targetId = crypto.randomUUID();
  const linkSchema = createResourceLinkSchema(ResourceLinkType.Dataset);
  const recursiveSchema = z.object({
    get children() {
      return z.array(recursiveSchema);
    },
    id: linkSchema.or(z.literal("")),
  });

  test("declares nothing for a schema holding no link", () => {
    expect.hasAssertions();

    expect(createGetResourceLinkTargets(z.object({ id: z.uuid() }))).toBeUndefined();
  });

  test.each([
    { schema: z.object({ id: linkSchema }), title: "a property", value: { id: targetId } },
    { schema: z.object({ id: linkSchema.optional() }), title: "an optional property", value: { id: targetId } },
    { schema: z.object({ id: linkSchema.or(z.literal("")) }), title: "a union", value: { id: targetId } },
    { schema: z.object({ ids: z.array(linkSchema) }), title: "an array", value: { ids: [targetId] } },
    { schema: z.record(z.string(), linkSchema), title: "a record", value: { "": targetId } },
    {
      schema: recursiveSchema,
      title: "a recursive shape nested past its first level",
      value: { children: [{ children: [{ children: [], id: targetId }], id: "" }], id: "" },
    },
  ])("reads a link held by $title", ({ schema, value }) => {
    expect.hasAssertions();

    const getResourceLinkTargets = createGetResourceLinkTargets(schema);
    assert.exists(getResourceLinkTargets);

    expect(getResourceLinkTargets(value)).toStrictEqual([{ targetId, type: ResourceLinkType.Dataset }]);
  });

  test("reads an empty id as no link", () => {
    expect.hasAssertions();

    const getResourceLinkTargets = createGetResourceLinkTargets(z.object({ id: linkSchema.or(z.literal("")) }));
    assert.exists(getResourceLinkTargets);

    expect(getResourceLinkTargets({ id: "" })).toStrictEqual([]);
  });

  test("reads a target several fields hold as one link", () => {
    expect.hasAssertions();

    const getResourceLinkTargets = createGetResourceLinkTargets(z.object({ ids: z.array(linkSchema) }));
    assert.exists(getResourceLinkTargets);

    expect(getResourceLinkTargets({ ids: [targetId, targetId] })).toStrictEqual([
      { targetId, type: ResourceLinkType.Dataset },
    ]);
  });
});

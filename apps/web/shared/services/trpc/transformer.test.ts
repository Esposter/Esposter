import { transformer } from "#shared/services/trpc/transformer";
import { jsonDateParse } from "@esposter/shared";
import { expect, test, vi } from "vitest";

test("keeps tagging instances of a class a hot reload re-creates", async () => {
  expect.hasAssertions();
  vi.resetModules();
  vi.doMock(import("@esposter/db-schema"), async (importOriginal) => {
    const original = await importOriginal<typeof import("@esposter/db-schema")>();
    // A hot reload hands the class map a new class object while the transformer still holds the old one
    class StandardMessageEntity extends original.StandardMessageEntity {}
    return { ...original, StandardMessageEntity };
  });
  const { JSONClassMap } = await import("#shared/services/superjson/JSONClassMap");
  const createdAt = new Date(0);
  const entity = new JSONClassMap.StandardMessageEntity({
    createdAt,
    message: "hi",
    partitionKey: "room",
    rowKey: "row",
    updatedAt: createdAt,
    userId: "user",
  });

  const wire = transformer.serialize({ items: [entity] });
  expect(wire.meta?.values).toStrictEqual({ "items.0": [["custom", "StandardMessageEntity"]] });

  const deserializedPage = transformer.deserialize<{ items: { createdAt: Date }[] }>(
    jsonDateParse(JSON.stringify(wire)),
  );
  expect(deserializedPage.items[0]?.createdAt).toStrictEqual(createdAt);
});

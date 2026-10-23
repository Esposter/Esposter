import { transformer } from "#shared/services/trpc/transformer";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { expect, test, vi } from "vitest";

// Each evaluation of the class map gets a new class object, the way a hot reload or a second runner does
const mockStandardMessageEntity = () => {
  vi.doMock(import("@esposter/db-schema"), async (importOriginal) => {
    const original = await importOriginal<typeof import("@esposter/db-schema")>();
    class StandardMessageEntity extends original.StandardMessageEntity {}
    return { ...original, StandardMessageEntity };
  });
};

test("keeps tagging instances of a class a hot reload re-creates", async () => {
  expect.hasAssertions();
  vi.resetModules();
  mockStandardMessageEntity();
  const { JSONClassMap } = await import("#shared/services/superjson/JSONClassMap");
  const createdAt = new Date(0);
  const StandardMessageEntity = takeOne(JSONClassMap, "StandardMessageEntity");
  const entity = new StandardMessageEntity({
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

test("tags an instance a second evaluation of the class map did not create", async () => {
  expect.hasAssertions();
  vi.resetModules();
  mockStandardMessageEntity();
  const { JSONClassMap: firstJSONClassMap } = await import("#shared/services/superjson/JSONClassMap");
  const createdAt = new Date(0);
  const FirstStandardMessageEntity = takeOne(firstJSONClassMap, "StandardMessageEntity");
  const entity = new FirstStandardMessageEntity({
    createdAt,
    message: "hi",
    partitionKey: "room",
    rowKey: "row",
    updatedAt: createdAt,
    userId: "user",
  });

  // The dev server evaluates the class map again, so the second evaluation publishes its own classes
  vi.resetModules();
  mockStandardMessageEntity();
  const { JSONClassMap: secondJSONClassMap } = await import("#shared/services/superjson/JSONClassMap");
  expect(takeOne(secondJSONClassMap, "StandardMessageEntity")).not.toBe(FirstStandardMessageEntity);

  const wire = transformer.serialize({ items: [entity] });
  expect(wire.meta?.values).toStrictEqual({ "items.0": [["custom", "StandardMessageEntity"]] });
});

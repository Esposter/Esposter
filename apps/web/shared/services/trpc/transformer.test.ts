import { transformer } from "#shared/services/trpc/transformer";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { expect, test, vi } from "vitest";

// Each evaluation of the class map gets a new class object, the way a hot reload or a second runner does
const mockRow = () => {
  vi.doMock(import("#shared/models/resource/sheet/datasource/Row"), async (importOriginal) => {
    const original = await importOriginal<typeof import("#shared/models/resource/sheet/datasource/Row")>();
    class Row extends original.Row {}
    return { ...original, Row };
  });
};

test("keeps tagging instances of a class a hot reload re-creates", async () => {
  expect.hasAssertions();
  vi.resetModules();
  mockRow();
  const { JSONClassMap } = await import("#shared/services/superjson/JSONClassMap");
  const createdAt = new Date(0);
  const Row = takeOne(JSONClassMap, "Row");
  const entity = new Row({ createdAt, updatedAt: createdAt });

  const wire = transformer.serialize({ items: [entity] });
  expect(wire.meta?.values).toStrictEqual({ "items.0": [["custom", "Row"]] });

  const deserializedPage = transformer.deserialize<{ items: { createdAt: Date }[] }>(
    jsonDateParse(JSON.stringify(wire)),
  );
  expect(deserializedPage.items[0]?.createdAt).toStrictEqual(createdAt);
});

test("tags an instance a second evaluation of the class map did not create", async () => {
  expect.hasAssertions();
  vi.resetModules();
  mockRow();
  const { JSONClassMap: firstJSONClassMap } = await import("#shared/services/superjson/JSONClassMap");
  const createdAt = new Date(0);
  const FirstRow = takeOne(firstJSONClassMap, "Row");
  const entity = new FirstRow({ createdAt, updatedAt: createdAt });

  // The dev server evaluates the class map again, so the second evaluation publishes its own classes
  vi.resetModules();
  mockRow();
  const { JSONClassMap: secondJSONClassMap } = await import("#shared/services/superjson/JSONClassMap");
  expect(takeOne(secondJSONClassMap, "Row")).not.toBe(FirstRow);

  const wire = transformer.serialize({ items: [entity] });
  expect(wire.meta?.values).toStrictEqual({ "items.0": [["custom", "Row"]] });
});

import { JSONClassMap } from "#shared/services/superjson/JSONClassMap";
import { transformer } from "#shared/services/trpc/transformer";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe("jsonClassMap", () => {
  // A key is the name a serialized payload revives its class by, and the map's shorthand entries take it from the
  // Class's own name — so renaming a registered class would silently rename its key and strand what was written
  // Under the old one. The list is the on-disk format, written out so that change has to be made on purpose
  test("registers every class under its frozen key", () => {
    expect.hasAssertions();

    expect(Object.keys(JSONClassMap)).toStrictEqual([
      "BasicChartConfiguration",
      "BooleanColumn",
      "Chart",
      "ClickerSave",
      "ComputedColumn",
      "Dashboard",
      "DateColumn",
      "Dungeons",
      "EmailEditor",
      "NumberColumn",
      "Row",
      "StringColumn",
      "TodoListItem",
      "Visual",
      "WebpageEditor",
    ]);
  });

  // A top-level instance crosses the wire as its own class, holding the fields it was made with. The marker is a field no
  // Class declares, so a class whose constructor drops the revived fields cannot pass by holding its defaults
  test.each(Object.keys(JSONClassMap))("revives a top-level %s with the fields it was made with", (name) => {
    expect.hasAssertions();

    const Class = takeOne(JSONClassMap, name);
    const entity = Object.assign(new Class(), { marker: name });
    const wire = transformer.serialize(entity);
    const revived = transformer.deserialize<{ marker: string }>(jsonDateParse(JSON.stringify(wire)));

    expect(revived.constructor).toBe(Class);
    expect(revived.marker).toBe(name);
  });
});

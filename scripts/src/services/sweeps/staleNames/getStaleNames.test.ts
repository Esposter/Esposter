import { getStaleNames } from "#src/services/sweeps/staleNames/getStaleNames";
import { describe, expect, test } from "vitest";

describe(getStaleNames, () => {
  const path = "path";
  const sourceNames = new Set(["id", "readThing", "Thing"]);

  // The whole reason this scan exists: a scan that reports nothing reads exactly like a current tree, so the
  // First thing it owes is a planted violation it does report
  test("reports a code name the source no longer holds", () => {
    expect.hasAssertions();

    expect(getStaleNames([{ path, text: "`readThingById`" }], sourceNames)).toStrictEqual([
      { name: "readThingById", path },
    ]);
  });

  test("reports a name once per page", () => {
    expect.hasAssertions();

    expect(getStaleNames([{ path, text: "`readThingById` and `readThingById`" }], sourceNames)).toStrictEqual([
      { name: "readThingById", path },
    ]);
  });

  test.each([
    ["a name the source holds", "`readThing`"],
    ["a member access whose every segment the source holds", "`Thing.id`"],
    ["a lone capitalised word", "`Manual`"],
    ["a lowercase word", "`util`"],
    ["a placeholder", "`FooHookMap`"],
    ["a lone X standing in for a segment", "`useXStore`"],
    ["a path", "`app/services/readThingById.ts`"],
  ])("reports nothing for %s", (_, text) => {
    expect.hasAssertions();

    expect(getStaleNames([{ path, text }], sourceNames)).toStrictEqual([]);
  });

  test.each(["rejected", "deferred", "proposals"])("reports nothing on a page under %s", (folder) => {
    expect.hasAssertions();

    expect(getStaleNames([{ path: `a/${folder}/${path}`, text: "`readThingById`" }], sourceNames)).toStrictEqual([]);
  });
});

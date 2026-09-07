import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";
import { describe, expect, test } from "vitest";

describe(parseDictionaryToArray, () => {
  test("parses with default id key", () => {
    expect.hasAssertions();

    expect(
      parseDictionaryToArray({
        "": { "": "" },
      }),
    ).toStrictEqual([{ "": "", id: "" }]);
  });

  test("parses with custom id key", () => {
    expect.hasAssertions();

    expect(parseDictionaryToArray({ "": { "": "" } }, "")).toStrictEqual([{ "": "" }]);
  });

  // Every caller passes a module-level definition map or a reactive store map, so writing the id back onto
  // The entry would leak the key into the shared data every later read sees
  test("leaves the dictionary it read untouched", () => {
    expect.hasAssertions();

    const entry = { name: "" };
    const dictionary = { a: entry };

    parseDictionaryToArray(dictionary);

    expect(entry).toStrictEqual({ name: "" });
  });
});

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
});

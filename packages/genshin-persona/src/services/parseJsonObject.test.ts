import { parseJsonObject } from "#src/services/parseJsonObject";
import { describe, expect, test } from "vitest";

describe(parseJsonObject, () => {
  test("reads an object root back whole", () => {
    expect.hasAssertions();

    expect(parseJsonObject('{"key":"key"}')).toStrictEqual({ key: "key" });
  });

  test.each(["null", "[]", '""', "0"])("drops the %s root its reader cannot destructure", (text) => {
    expect.hasAssertions();

    expect(parseJsonObject(text)).toStrictEqual({});
  });
});

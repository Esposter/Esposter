import { jsonDateParse } from "#src/util/object/jsonDateParse";
import { describe, expect, test } from "vitest";

describe(jsonDateParse, () => {
  test("parses ISO dates", () => {
    expect.hasAssertions();

    const object = { "": new Date(0) };

    expect(jsonDateParse(JSON.stringify(object))).toStrictEqual(object);
  });

  test("parses MS Ajax dates", () => {
    expect.hasAssertions();

    expect(jsonDateParse('{"": "/Date(0)/"}')).toStrictEqual({ "": new Date(0) });
  });
});

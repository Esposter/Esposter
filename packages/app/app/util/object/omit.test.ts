import { omit } from "@/util/object/omit";
import { describe, expect, test } from "vitest";

describe(omit, () => {
  test("omits", () => {
    expect.hasAssertions();

    expect(omit({ "": "" }, [""])).toStrictEqual({});
  });
});

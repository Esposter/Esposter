import { omitDeep } from "@/util/object/omitDeep";
import { describe, expect, test } from "vitest";

describe(omitDeep, () => {
  test("omits", () => {
    expect.hasAssertions();

    expect(omitDeep({ "": "" }, "")).toStrictEqual({});
    expect(omitDeep({ "": { "": "" } }, "")).toStrictEqual({});
    expect(omitDeep({ "": { "": "" } }, ".")).toStrictEqual({ "": {} });
  });
});

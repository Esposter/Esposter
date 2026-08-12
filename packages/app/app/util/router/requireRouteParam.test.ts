import { requireRouteParam } from "@/util/router/requireRouteParam";
import { InvalidOperationError } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(requireRouteParam, () => {
  const id = crypto.randomUUID();

  test("present param", () => {
    expect.hasAssertions();

    expect(requireRouteParam({ id }, "id")).toBe(id);
  });

  // A repeatable segment arrives as an array, and the first entry is its one canonical value
  test("repeated param", () => {
    expect.hasAssertions();

    expect(requireRouteParam({ id: [id, crypto.randomUUID()] }, "id")).toBe(id);
  });

  // The two shapes a segment the page cannot exist without must never be allowed to reach a query as
  test.each([
    ["missing", {}],
    ["empty", { id: "" }],
  ])("throws on a %s param", (_description, params) => {
    expect.hasAssertions();

    expect(() => requireRouteParam(params, "id")).toThrow(InvalidOperationError);
  });

  // The name is in the message because it is the only thing that says which segment the route was missing
  test("names the missing param", () => {
    expect.hasAssertions();

    expect(() => requireRouteParam({}, "rowKey")).toThrow("Missing route param: rowKey");
  });
});

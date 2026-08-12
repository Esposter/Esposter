import { requireRouteParam } from "@/util/router/requireRouteParam";
import { InvalidOperationError, Operation } from "@esposter/shared";
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

  // The two shapes a segment the page cannot exist without must never be allowed to reach a query as. The name
  // Is in the message because it is the only thing that says which segment the route was missing
  test.each([
    ["missing", {}],
    ["empty", { id: "" }],
  ])("throws on a %s param", (_description, params) => {
    expect.hasAssertions();

    expect(() => requireRouteParam(params, "id")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, requireRouteParam.name, "Missing route param: id").message}]`,
    );
  });
});

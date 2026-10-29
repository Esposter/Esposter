import { checkIsSafeViewPayload } from "@/services/dashboard/chart/checkIsSafeViewPayload";
import { describe, expect, test } from "vitest";

describe(checkIsSafeViewPayload, () => {
  test("accepts a payload of plain objects, arrays and scalars", () => {
    expect.hasAssertions();

    expect(checkIsSafeViewPayload({ v: 1, view: { hidden: ["a"], points: [{ x: 1, y: 2 }], zoom: [0, 10] } })).toBe(
      true,
    );
  });

  test("refuses a payload with a prototype key at any depth, whatever the key holds", () => {
    expect.hasAssertions();

    // oxlint-disable-next-line no-restricted-properties -- the payload has no Date to revive, and only JSON.parse makes an own __proto__ key
    expect(checkIsSafeViewPayload(JSON.parse('{"__proto__":{"polluted":true}}'))).toBe(false);
    expect(checkIsSafeViewPayload({ view: { constructor: { prototype: {} } } })).toBe(false);
    expect(checkIsSafeViewPayload({ view: [{ prototype: 1 }] })).toBe(false);
  });

  test("accepts a null payload, which carries no key to refuse, leaving the caller's guard to skip it", () => {
    expect.hasAssertions();

    expect(checkIsSafeViewPayload(null)).toBe(true);
  });
});

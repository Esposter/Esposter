import { parseNumbers } from "#src/parseNumbers";
import { describe, expect, test } from "vitest";

describe(parseNumbers, () => {
  test("parses numeric strings and passes the rest through", () => {
    expect.hasAssertions();

    expect(parseNumbers("1")).toBe(1);
    expect(parseNumbers("-1")).toBe(-1);
    expect(parseNumbers("1.5")).toBe(1.5);
    expect(parseNumbers("1e3")).toBe(1000);
    expect(parseNumbers("")).toBe(0);
    expect(parseNumbers("text")).toBe("text");
  });
});

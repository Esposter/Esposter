import { parseNumbers } from "#src/parseNumbers";
import { describe, expect, test } from "vitest";

describe(parseNumbers, () => {
  test("parses numeric strings and passes the rest through", () => {
    expect.hasAssertions();

    expect(parseNumbers("1")).toBe(1);
    expect(parseNumbers("-1")).toBe(-1);
    expect(parseNumbers("0.1")).toBe(0.1);
    expect(parseNumbers("1e1")).toBe(10);
    expect(parseNumbers("")).toBe(0);
    expect(parseNumbers("a")).toBe("a");
  });
});

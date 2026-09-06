import { parseBooleans } from "#src/parseBooleans";
import { describe, expect, test } from "vitest";

describe(parseBooleans, () => {
  test("parses boolean strings case-insensitively and passes the rest through", () => {
    expect.hasAssertions();

    expect(parseBooleans("true")).toBe(true);
    expect(parseBooleans("TRUE")).toBe(true);
    expect(parseBooleans("false")).toBe(false);
    expect(parseBooleans("text")).toBe("text");
  });
});

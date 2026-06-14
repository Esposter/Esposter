import { createTableBorder } from "@/checkDependencies/createTableBorder";
import { describe, expect, test } from "vitest";

describe(createTableBorder, () => {
  test("pads each column by two for a single column", () => {
    expect.hasAssertions();

    expect(createTableBorder("┌", "┬", "┐", [0])).toBe("┌──┐");
  });

  test("joins multiple columns with the separator", () => {
    expect.hasAssertions();

    expect(createTableBorder("┌", "┬", "┐", [0, 0])).toBe("┌──┬──┐");
  });
});

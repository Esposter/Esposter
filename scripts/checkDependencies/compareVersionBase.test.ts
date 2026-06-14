import { compareVersionBase } from "@/checkDependencies/compareVersionBase";
import { describe, expect, test } from "vitest";

describe(compareVersionBase, () => {
  test("returns a negative number when the left base is lower", () => {
    expect.hasAssertions();

    expect(Math.sign(compareVersionBase("0.0.0", "0.0.1"))).toBe(-1);
  });

  test("returns a positive number when the left base is higher", () => {
    expect.hasAssertions();

    expect(Math.sign(compareVersionBase("0.0.1", "0.0.0"))).toBe(1);
  });

  test("returns zero when the bases are equal", () => {
    expect.hasAssertions();

    expect(compareVersionBase("0.0.0", "0.0.0")).toBe(0);
  });

  test("compares major before minor before patch", () => {
    expect.hasAssertions();

    expect(Math.sign(compareVersionBase("0.1.0", "0.0.1"))).toBe(1);
  });
});

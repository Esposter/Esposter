import { getSpecifierBase } from "@/checkDependencies/getSpecifierBase";
import { describe, expect, test } from "vitest";

describe(getSpecifierBase, () => {
  test("strips a caret range prefix", () => {
    expect.hasAssertions();

    expect(getSpecifierBase("^0.0.0")).toBe("0.0.0");
  });

  test("strips a comparison range prefix", () => {
    expect.hasAssertions();

    expect(getSpecifierBase(">=0.0.0")).toBe("0.0.0");
  });

  test("leaves a bare version untouched", () => {
    expect.hasAssertions();

    expect(getSpecifierBase("0.0.0")).toBe("0.0.0");
  });
});

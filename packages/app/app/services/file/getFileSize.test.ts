import { KIBIBYTE } from "#shared/services/app/constants";
import { getFileSize } from "@/services/file/getFileSize";
import { describe, expect, test } from "vitest";

describe(getFileSize, () => {
  test("returns 0 B for non-positive sizes", () => {
    expect.hasAssertions();

    expect(getFileSize(0)).toBe("0 B");
    expect(getFileSize(-1)).toBe("0 B");
  });

  test("returns 0 B for non-finite sizes", () => {
    expect.hasAssertions();

    expect(getFileSize(NaN)).toBe("0 B");
    expect(getFileSize(Infinity)).toBe("0 B");
  });

  test("formats bytes below a kibibyte", () => {
    expect.hasAssertions();

    expect(getFileSize(1)).toBe("1 B");
    expect(getFileSize(512)).toBe("512 B");
  });

  test("scales up to the appropriate unit", () => {
    expect.hasAssertions();

    expect(getFileSize(KIBIBYTE)).toBe("1 KB");
    expect(getFileSize(KIBIBYTE ** 2)).toBe("1 MB");
  });

  test("promotes to the next unit when rounding reaches a full unit", () => {
    expect.hasAssertions();

    expect(getFileSize(KIBIBYTE ** 2 - 1)).toBe("1 MB");
  });

  test("clamps to the largest known unit", () => {
    expect.hasAssertions();

    expect(getFileSize(2 * KIBIBYTE ** 8)).toBe("2 YB");
  });
});

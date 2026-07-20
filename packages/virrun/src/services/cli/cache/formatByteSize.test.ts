import { formatByteSize } from "@/services/cli/cache/formatByteSize";
import { describe, expect, test } from "vitest";

describe(formatByteSize, () => {
  test("renders whole bytes without a fraction below one kibibyte", () => {
    expect.hasAssertions();

    expect(formatByteSize(512)).toBe("512 B");
  });

  test("scales into the largest unit at least one, to one decimal place", () => {
    expect.hasAssertions();

    expect(formatByteSize(1536)).toBe("1.5 KiB");
    expect(formatByteSize(1024 ** 2)).toBe("1.0 MiB");
    expect(formatByteSize(1024 ** 3)).toBe("1.0 GiB");
  });

  test("clamps zero and negative totals to zero bytes", () => {
    expect.hasAssertions();

    expect(formatByteSize(0)).toBe("0 B");
    expect(formatByteSize(-1)).toBe("0 B");
  });
});

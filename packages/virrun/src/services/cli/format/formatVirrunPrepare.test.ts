import { stripAnsi } from "@/services/cli/color/stripAnsi.test";
import { formatVirrunPrepare } from "@/services/cli/format/formatVirrunPrepare";
import { describe, expect, test } from "vitest";

describe(formatVirrunPrepare, () => {
  const key = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  test("announces a prepare cache miss when the layer does not exist", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunPrepare({ exists: false, key }))).toBe(
      "[virrun] prepare cache miss (source 0123456789ab) — regenerating framework artifacts once",
    );
  });

  test("announces a prepare cache hit when the layer is warm", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunPrepare({ exists: true, key }))).toBe(
      "[virrun] prepare cache hit (source 0123456789ab)",
    );
  });
});

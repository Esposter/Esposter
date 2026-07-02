import { isVersionAtLeast } from "@/services/cli/run/isVersionAtLeast";
import { describe, expect, test } from "vitest";

const minimum = "0.10.0";

describe(isVersionAtLeast, () => {
  test("accepts an equal version", () => {
    expect.hasAssertions();

    expect(isVersionAtLeast("0.10.0", minimum)).toBe(true);
  });

  test("accepts a higher minor and patch", () => {
    expect.hasAssertions();

    expect(isVersionAtLeast("0.11.1", minimum)).toBe(true);
  });

  test("rejects a lower minor", () => {
    expect.hasAssertions();

    expect(isVersionAtLeast("0.9.9", minimum)).toBe(false);
  });

  test("extracts the triple from a `bwrap --version` line", () => {
    expect.hasAssertions();

    expect(isVersionAtLeast("bubblewrap 0.11.1", minimum)).toBe(true);
  });

  test("treats an unparseable version as below the minimum", () => {
    expect.hasAssertions();

    expect(isVersionAtLeast("unknown", minimum)).toBe(false);
  });
});

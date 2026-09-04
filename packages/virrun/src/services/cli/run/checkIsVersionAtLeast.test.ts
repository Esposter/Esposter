import { checkIsVersionAtLeast } from "#src/services/cli/run/checkIsVersionAtLeast";
import { describe, expect, test } from "vitest";

describe(checkIsVersionAtLeast, () => {
  const minimum = "0.10.0";

  test("accepts an equal version", () => {
    expect.hasAssertions();

    expect(checkIsVersionAtLeast("0.10.0", minimum)).toBe(true);
  });

  test("accepts a higher minor and patch", () => {
    expect.hasAssertions();

    expect(checkIsVersionAtLeast("0.11.1", minimum)).toBe(true);
  });

  test("rejects a lower minor", () => {
    expect.hasAssertions();

    expect(checkIsVersionAtLeast("0.9.9", minimum)).toBe(false);
  });

  test("extracts the triple from a `bwrap --version` line", () => {
    expect.hasAssertions();

    expect(checkIsVersionAtLeast("bubblewrap 0.11.1", minimum)).toBe(true);
  });

  test("treats an unparseable version as below the minimum", () => {
    expect.hasAssertions();

    expect(checkIsVersionAtLeast("unknown", minimum)).toBe(false);
  });
});

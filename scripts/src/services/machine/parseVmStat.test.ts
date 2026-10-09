import { parseVmStat } from "#src/services/machine/parseVmStat";
import { describe, expect, test } from "vitest";

describe(parseVmStat, () => {
  test("counts free, inactive, speculative and purgeable pages at the page size", () => {
    expect.hasAssertions();

    const output = `Mach Virtual Memory Statistics: (page size of 16384 bytes)
Pages free:                               12345.
Pages active:                            234567.
Pages inactive:                           23456.
Pages speculative:                         1234.
Pages throttled:                              0.
Pages wired down:                        345678.
Pages purgeable:                           2345.
`;

    expect(parseVmStat(output)).toBe(645201920);
  });

  test("rejects output with no page size", () => {
    expect.hasAssertions();

    expect(() => parseVmStat("Pages free: 1.")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: vm_stat, reports no page size in its header]`,
    );
  });
});

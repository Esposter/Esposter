import { readAreaUnits } from "#src/services/sweeps/ledgerCoverage/readPartitionUnits";
import { describe, expect, test } from "vitest";

describe(readAreaUnits, () => {
  test("reads each bullet as one unit, cell as written, and no line of the title or preamble", () => {
    expect.hasAssertions();

    const text = "# Title\n\nA preamble naming `a/b` in prose.\n\n- `a/b`\n- `c` — `d.ts`, `e.ts`\n";

    expect(readAreaUnits(text)).toStrictEqual(["`a/b`", "`c` — `d.ts`, `e.ts`"]);
  });
});

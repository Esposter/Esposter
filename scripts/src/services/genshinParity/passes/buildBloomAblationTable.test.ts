import type { BloomAblationRow } from "#src/models/genshinParity/passes/BloomAblationRow";

import { BloomResize } from "#src/models/genshinParity/passes/BloomResize";
import { buildBloomAblationTable } from "#src/services/genshinParity/passes/buildBloomAblationTable";
import { describe, expect, test } from "vitest";

describe(buildBloomAblationTable, () => {
  const DEFAULT_STRUCTURE = { blurForm: "separable", blurPasses: 1, prefilter: "oneTap", tapOffset: 0.5 } as const;
  const ROTATED_STRUCTURE = { blurForm: "rotated", blurPasses: 2, prefilter: "fourTap", tapOffset: 1 } as const;

  test("prints a row per structure with its readings, their mean and whether the gate holds", () => {
    expect.hasAssertions();

    const rows: BloomAblationRow[] = [
      { measurement: BloomResize.Display, readings: { "login-door-session": 1.4989 }, structure: DEFAULT_STRUCTURE },
      { measurement: BloomResize.Source, readings: { "login-door-session": -0.25 }, structure: ROTATED_STRUCTURE },
    ];
    const [header, separator, defaultRow, rotatedRow] = buildBloomAblationTable(rows).split("\n");
    expect(header).toBe("| Prefilter | Tap offset | Blur | Measured at | login-door-session | Mean | Holds |");
    expect(separator).toBe("| --- | --- | --- | --- | --- | --- | --- |");
    expect(defaultRow).toBe("| one tap | 0.5 | separable ×1 | display width | 1.4989 | 1.4989 | no |");
    expect(rotatedRow).toBe("| four taps | 1.0 | rotated ×2 | reference's width, resized | -0.2500 | -0.2500 | yes |");
  });

  test("holds nothing that reads no white, and says so where a reading is missing", () => {
    expect.hasAssertions();

    const rows: BloomAblationRow[] = [
      { measurement: BloomResize.Display, readings: { "login-door-session": Infinity }, structure: DEFAULT_STRUCTURE },
    ];
    expect(buildBloomAblationTable(rows).split("\n")[2]).toBe(
      "| one tap | 0.5 | separable ×1 | display width | none | none | no |",
    );
  });
});

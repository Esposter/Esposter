import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { findReopenedPass } from "#src/services/genshinParity/passes/findReopenedPass";
import { describe, expect, test } from "vitest";

describe(findReopenedPass, () => {
  test("a frame that stands off reopens the missed pass", () => {
    expect.hasAssertions();

    const measure = { notes: [], readings: [] };
    const reopened = findReopenedPass([
      { isHeld: true, measure, pass: ParityPass.Inventory },
      { isHeld: false, measure, pass: ParityPass.Layout },
    ]);

    expect(reopened).toBe(ParityPass.Layout);
    expect(findReopenedPass([{ isHeld: true, measure, pass: ParityPass.Inventory }])).toBeUndefined();
  });
});

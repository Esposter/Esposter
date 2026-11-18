import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { findReopenedPass } from "#src/services/genshinParity/passes/findReopenedPass";
import { toParityPassRows } from "#src/services/genshinParity/passes/toParityPassRows";
import { describe, expect, test } from "vitest";

const HELD_READING = { gate: 1, name: "outline", unit: "px", value: 0.5 };
const MISSED_READING = { gate: 1, name: "outline", unit: "px", value: 2 };
const toRows = (pass: ParityPass, isHeld: boolean): string[] =>
  toParityPassRows({
    isHeld,
    measure: { notes: [], readings: [isHeld ? HELD_READING : MISSED_READING] },
    pass,
  } satisfies ParityPassResult);

describe(findReopenedPass, () => {
  test("a frame that stands off reopens the missed pass", () => {
    expect.hasAssertions();

    const reopened = findReopenedPass([...toRows(ParityPass.Inventory, true), ...toRows(ParityPass.Layout, false)]);

    expect(reopened).toBe(ParityPass.Layout);
    expect(findReopenedPass(toRows(ParityPass.Inventory, true))).toBeUndefined();
  });
});

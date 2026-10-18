import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { findMovedFrozenPass } from "#src/services/genshinParity/passes/findMovedFrozenPass";
import { toParityPassRows } from "#src/services/genshinParity/passes/toParityPassRows";
import { describe, expect, test } from "vitest";

const createResult = (pass: ParityPass, value: number, isHeld = true): ParityPassResult => ({
  isHeld,
  measure: { notes: [], readings: [{ gate: 1, name: "a", unit: "m", value }] },
  pass,
});

describe(findMovedFrozenPass, () => {
  test("a later pass cannot move a frozen result", () => {
    expect.hasAssertions();

    const recordedRows = toParityPassRows(createResult(ParityPass.Layout, 0));

    expect(
      findMovedFrozenPass({
        passAlone: ParityPass.Surface,
        recordedRows,
        results: [createResult(ParityPass.Layout, 1), createResult(ParityPass.Surface, 0)],
      }),
    ).toBe(ParityPass.Layout);
  });

  test("a frozen result the later pass leaves as it was moves nothing", () => {
    expect.hasAssertions();

    const recordedRows = toParityPassRows(createResult(ParityPass.Layout, 0));

    expect(
      findMovedFrozenPass({
        passAlone: ParityPass.Surface,
        recordedRows,
        results: [createResult(ParityPass.Layout, 0), createResult(ParityPass.Surface, 1)],
      }),
    ).toBeUndefined();
  });

  test("the pass the run takes up is measured afresh, not held to its own rows", () => {
    expect.hasAssertions();

    const recordedRows = toParityPassRows(createResult(ParityPass.Surface, 0));

    expect(
      findMovedFrozenPass({
        passAlone: ParityPass.Surface,
        recordedRows,
        results: [createResult(ParityPass.Layout, 0), createResult(ParityPass.Surface, 1)],
      }),
    ).toBeUndefined();
  });

  test("a pass not held is not frozen, so a later run does not name it", () => {
    expect.hasAssertions();

    const recordedRows = toParityPassRows(createResult(ParityPass.Layout, 0));

    expect(
      findMovedFrozenPass({
        passAlone: ParityPass.Surface,
        recordedRows,
        results: [createResult(ParityPass.Layout, 1, false), createResult(ParityPass.Surface, 0)],
      }),
    ).toBeUndefined();
  });

  test("a full run has no later pass to move a frozen result", () => {
    expect.hasAssertions();

    const recordedRows = toParityPassRows(createResult(ParityPass.Layout, 0));

    expect(findMovedFrozenPass({ recordedRows, results: [createResult(ParityPass.Layout, 1)] })).toBeUndefined();
  });
});

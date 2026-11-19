import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { findMovedGate } from "#src/services/genshinParity/passes/findMovedGate";
import { toParityPassRows } from "#src/services/genshinParity/passes/toParityPassRows";
import { describe, expect, test } from "vitest";

const createResult = (gate: number, value = 0.3): ParityPassResult => ({
  isHeld: false,
  measure: { notes: [], readings: [{ gate, name: "Door structure", unit: "share", value }] },
  pass: ParityPass.Surface,
});

describe(findMovedGate, () => {
  test("a run that moves a recorded gate is named with the gate the report holds and the one it would write", () => {
    expect.hasAssertions();

    const recordedRows = toParityPassRows(createResult(0.0194));

    expect(findMovedGate({ recordedRows, results: [createResult(0.0268)] })).toStrictEqual({
      measured: "0.0268",
      name: "Door structure",
      pass: ParityPass.Surface,
      recorded: "0.0194",
    });
  });

  test("a run that holds every recorded gate names none, though its values have moved", () => {
    expect.hasAssertions();

    const recordedRows = toParityPassRows(createResult(0.0194, 0.3));

    expect(findMovedGate({ recordedRows, results: [createResult(0.0194, 0.5)] })).toBeUndefined();
  });

  test("a reading the report holds no row for moves no gate", () => {
    expect.hasAssertions();

    expect(findMovedGate({ recordedRows: [], results: [createResult(0.0268)] })).toBeUndefined();
  });
});

import { computeLayoutFrameMeasure } from "#src/services/genshinParity/passes/computeLayoutFrameMeasure";
import { FRAME_GATE_PIXELS } from "#src/services/genshinParity/passes/constants";
import { describe, expect, test } from "vitest";

describe(computeLayoutFrameMeasure, () => {
  const name = "Bridges";

  test("skips a family on a reference whose frame shows none of its parts, read on one that does", () => {
    expect.hasAssertions();

    expect(
      computeLayoutFrameMeasure(
        [name],
        [
          { families: [{ gaps: [], name }], referenceId: "a" },
          { families: [{ gaps: [0, 1], name }], referenceId: "b" },
        ],
      ),
    ).toStrictEqual({
      notes: [`a ${name}: skipped, no part on the frame`],
      readings: [{ gate: FRAME_GATE_PIXELS, name: `b ${name}`, unit: "px", value: 1 }],
    });
  });

  test("misses a family on no reference's frame", () => {
    expect.hasAssertions();

    expect(computeLayoutFrameMeasure([name], [{ families: [{ gaps: [], name }], referenceId: "a" }])).toStrictEqual({
      notes: [`a ${name}: skipped, no part on the frame`],
      readings: [{ gate: FRAME_GATE_PIXELS, name: `${name} on no reference's frame`, unit: "px", value: Infinity }],
    });
  });
});

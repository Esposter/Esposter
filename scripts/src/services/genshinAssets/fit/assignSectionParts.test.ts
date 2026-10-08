import { assignSectionParts } from "#src/services/genshinAssets/fit/assignSectionParts";
import { describe, expect, test } from "vitest";

describe(assignSectionParts, () => {
  test("names each section for the part reaching furthest in the most of its sectors", () => {
    expect.hasAssertions();

    // Two sectors, one on each side of the axis, and a band a unit high apiece
    expect(
      assignSectionParts([{ height: 1 }, { height: 1 }], { axis: [0, 0], foot: 0 }, 2, {
        High: [
          [2, 1.5, 0],
          [-2, 1.5, 0],
          [0.5, 1.5, 0],
        ],
        Low: [
          [1, 0.5, 0],
          [-1, 0.5, 0],
        ],
      }),
    ).toStrictEqual(["Low", "High"]);
  });

  test("keeps the part below a section no part stands in", () => {
    expect.hasAssertions();

    expect(
      assignSectionParts([{ height: 1 }, { height: 1 }, { height: 1 }], { axis: [0, 0], foot: 0 }, 2, {
        High: [[2, 2.5, 0]],
        Low: [[1, 0.5, 0]],
      }),
    ).toStrictEqual(["Low", "Low", "High"]);
  });
});

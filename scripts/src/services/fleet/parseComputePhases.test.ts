import { parseComputePhases } from "#src/services/fleet/parseComputePhases";
import { describe, expect, test } from "vitest";

describe(parseComputePhases, () => {
  test("reads each row's folder and phase, and skips a phase off the list and a row past the section", () => {
    expect.hasAssertions();

    expect(
      parseComputePhases(
        [
          "## Phases",
          "",
          "| Area | Page | Phase |",
          "| :--- | :--- | :---: |",
          "| Alpha | [Alpha](alpha/design.md) | 4 |",
          "| Beta | [Beta](beta/design.md) | 8 |",
          "",
          "## Bars",
          "",
          "| Gamma | [Gamma](gamma/design.md) | 1 |",
          "",
        ].join("\n"),
      ),
    ).toStrictEqual(new Map([["alpha", 4]]));
  });
});

import { ComputeKind } from "#src/models/fleet/ComputeKind";
import { parseComputePhases } from "#src/services/fleet/parseComputePhases";
import { describe, expect, test } from "vitest";

describe(parseComputePhases, () => {
  test("reads each row's folder, kind and phase, and skips a phase off the list and a row past the section", () => {
    expect.hasAssertions();

    expect(
      parseComputePhases(
        [
          "## Phases",
          "",
          "| Area | Page | Kind | Phase |",
          "| :--- | :--- | :--- | :---: |",
          "| Alpha | [Alpha](alpha/design.md) | Screen | 4 |",
          "| Beta | [Beta](beta/design.md) | Region | 8 |",
          "",
          "## Bars",
          "",
          "| Gamma | [Gamma](gamma/design.md) | Scene | 1 |",
          "",
        ].join("\n"),
      ),
    ).toStrictEqual(new Map([["alpha", { kind: ComputeKind.Screen, phase: 4 }]]));
  });

  test("throws on a row whose kind is not a compute kind, naming its page", () => {
    expect.hasAssertions();

    expect(() =>
      parseComputePhases(["## Phases", "", "| Alpha | [Alpha](alpha/design.md) | Gadget | 4 |", ""].join("\n")),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: alpha/design.md, its Kind is Gadget, not one of Screen, Region, Scene, Pieces, Dataset]`,
    );
  });
});

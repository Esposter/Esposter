import { toSurfaceWavelengthDiagnostics } from "#src/services/genshinParity/passes/toSurfaceWavelengthDiagnostics";
import { describe, expect, test } from "vitest";

describe(toSurfaceWavelengthDiagnostics, () => {
  test("a family's wavelengths are diagnostics with no gate, and ours reads its reason where no lobe resolves", () => {
    expect.hasAssertions();

    expect(
      toSurfaceWavelengthDiagnostics({ exportsWavelength: 2.56, family: "Towers", oursWavelength: undefined }),
    ).toStrictEqual([
      { name: "Towers surface detail wavelength, exports", unit: "m", value: 2.56 },
      { name: "Towers surface detail wavelength, ours", reason: "no detail lobe resolved", unit: "m" },
    ]);
  });
});

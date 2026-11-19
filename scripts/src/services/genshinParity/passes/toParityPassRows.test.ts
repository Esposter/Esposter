import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { toParityPassRows } from "#src/services/genshinParity/passes/toParityPassRows";
import { describe, expect, test } from "vitest";

describe(toParityPassRows, () => {
  test("a reading with no value prints its reason and no unit beside it", () => {
    expect.hasAssertions();

    const result = {
      isHeld: false,
      measure: {
        notes: [],
        readings: [{ gate: 0.228, name: "Towers wavelength", reason: "no detail lobe resolved", unit: "m" }],
      },
      pass: ParityPass.Shape,
    } satisfies ParityPassResult;

    expect(toParityPassRows(result)).toStrictEqual([
      "| Shape | Towers wavelength | no detail lobe resolved | 0.2280 |  | no |",
    ]);
  });

  test("a diagnostic prints its value with no gate and no held verdict, after the gated readings", () => {
    expect.hasAssertions();

    const result = {
      isHeld: true,
      measure: {
        diagnostics: [{ name: "Towers wavelength, exports", unit: "m", value: 2.56 }],
        notes: [],
        readings: [{ gate: 1, name: "Towers normal", unit: "degrees", value: 0.5 }],
      },
      pass: ParityPass.Shape,
    } satisfies ParityPassResult;

    expect(toParityPassRows(result)).toStrictEqual([
      "| Shape | Towers normal | 0.5000 | 1 | degrees | yes |",
      "| Shape | Towers wavelength, exports | 2.5600 | - | m | - |",
    ]);
  });
});

import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { runParityPasses } from "#src/services/genshinParity/passes/runParityPasses";
import { describe, expect, test, vi } from "vitest";

const { measureCamera, measureInventory, measureLayout } = vi.hoisted(() => ({
  measureCamera: vi.fn<() => Promise<ParityPassMeasure>>(),
  measureInventory: vi.fn<() => Promise<ParityPassMeasure>>(),
  measureLayout: vi.fn<() => Promise<ParityPassMeasure>>(),
}));

vi.mock(import("#src/services/genshinParity/passes/ParityPassMeasureMap"), () => ({
  ParityPassMeasureMap: {
    [ParityPass.Camera]: measureCamera,
    [ParityPass.Inventory]: measureInventory,
    [ParityPass.Layout]: measureLayout,
  },
}));

describe(runParityPasses, () => {
  const held: ParityPassMeasure = { notes: [], readings: [{ gate: 1, name: "", unit: "", value: 1 }] };
  const failed: ParityPassMeasure = { notes: [], readings: [{ gate: 0, name: "", unit: "", value: 1 }] };

  test("stops at the first pass that fails its gate", async () => {
    expect.hasAssertions();

    measureInventory.mockResolvedValueOnce(held);
    measureLayout.mockResolvedValueOnce(failed);
    const results = await runParityPasses(DerivedAssetComponent.Login);

    expect(results).toStrictEqual([
      { isHeld: true, measure: held, pass: ParityPass.Inventory },
      { isHeld: false, measure: failed, pass: ParityPass.Layout },
    ]);
    expect(measureCamera).not.toHaveBeenCalled();
  });

  test("stops at a pass that reads nothing, and at the first with no measure", async () => {
    expect.hasAssertions();

    const empty: ParityPassMeasure = { notes: [], readings: [] };
    measureInventory.mockResolvedValueOnce(empty);
    const emptyResults = await runParityPasses(DerivedAssetComponent.Login);
    measureInventory.mockResolvedValueOnce(held);
    measureLayout.mockResolvedValueOnce(held);
    measureCamera.mockResolvedValueOnce(held);
    const unbuiltResults = await runParityPasses(DerivedAssetComponent.Login);

    expect(emptyResults).toStrictEqual([{ isHeld: false, measure: empty, pass: ParityPass.Inventory }]);
    expect(unbuiltResults.at(-1)).toStrictEqual({
      isHeld: false,
      measure: { notes: ["no measure yet"], readings: [] },
      pass: ParityPass.Shape,
    });
  });
});

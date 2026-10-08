import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { openWitnessPage as baseOpenWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { FRAME_GATE_PIXELS } from "#src/services/genshinParity/passes/constants";
import { measureCamera } from "#src/services/genshinParity/passes/measureCamera";
import { describe, expect, test, vi } from "vitest";

const { openWitnessPage, solveReferenceCamera } = vi.hoisted(() => ({
  openWitnessPage: vi.fn<() => Promise<{ close: () => Promise<void>; page: object }>>(),
  solveReferenceCamera: vi.fn<() => Promise<{ errors: number[]; names: string[]; pose: number[]; rms: number }>>(),
}));

vi.mock(import("#src/services/genshinParity/passes/getCurrentBuildReferenceIds"), () => ({
  getCurrentBuildReferenceIds: () => ["own-bar", "global-bar"],
}));

vi.mock(import("#src/services/genshinParity/passes/solveReferenceCamera"), () => ({ solveReferenceCamera }));

vi.mock(import("#src/services/genshinParity/shared/fetchReferences"), () => ({
  fetchReferences: () => Promise.resolve(),
}));

vi.mock(import("#src/services/genshinParity/shared/openWitnessPage"), () => ({
  openWitnessPage: openWitnessPage as unknown as typeof baseOpenWitnessPage,
}));

vi.mock(import("#src/services/genshinParity/shared/ParityReferenceMap"), () => ({
  ParityReferenceMap: {
    "global-bar": { screen: "WorldScreen", wikiTitle: "File:Global.png" },
    "own-bar": { poseBar: 7.5, screen: "WorldScreen", wikiTitle: "File:Own.png" },
  } satisfies Record<string, ParityReference>,
}));

describe(measureCamera, () => {
  test("gates each reference at its own pose bar where it sets one, else at the camera pass's gate", async () => {
    expect.hasAssertions();

    openWitnessPage.mockResolvedValue({ close: () => Promise.resolve(), page: {} });
    solveReferenceCamera.mockResolvedValue({ errors: [], names: [], pose: [], rms: 5 });

    const { readings } = await measureCamera(DerivedAssetComponent.Windrise);

    expect(readings).toStrictEqual([
      { gate: 7.5, name: "own-bar", unit: "px", value: 5 },
      { gate: FRAME_GATE_PIXELS, name: "global-bar", unit: "px", value: 5 },
    ]);
  });
});

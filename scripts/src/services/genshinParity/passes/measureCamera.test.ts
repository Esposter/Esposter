import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { openWitnessPage as baseOpenWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import type { Page } from "playwright";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { FRAME_GATE_PIXELS } from "#src/services/genshinParity/passes/constants";
import { measureCamera } from "#src/services/genshinParity/passes/measureCamera";
import { describe, expect, test, vi } from "vitest";

const { openWitnessPage, solveReferenceCamera } = vi.hoisted(() => ({
  openWitnessPage: vi.fn<typeof baseOpenWitnessPage>(),
  solveReferenceCamera: vi.fn<() => Promise<{ errors: number[]; names: string[]; pose: number[]; rms: number }>>(),
}));

vi.mock(import("#src/services/genshinParity/passes/getCurrentBuildReferenceIds"), () => ({
  getCurrentBuildReferenceIds: () => ["own-bar", "global-bar"],
}));

vi.mock(import("#src/services/genshinParity/passes/solveReferenceCamera"), () => ({ solveReferenceCamera }));

vi.mock(import("#src/services/genshinParity/shared/fetchReferences"), () => ({
  fetchReferences: () => Promise.resolve(),
}));

vi.mock(import("#src/services/genshinParity/shared/openWitnessPage"), () => ({ openWitnessPage }));

vi.mock(import("#src/services/genshinParity/shared/ParityReferenceMap"), () => ({
  ParityReferenceMap: {
    "global-bar": { screen: "WorldScreen", wikiTitle: "File:Global.png" },
    "own-bar": { poseBar: 7.5, screen: "WorldScreen", wikiTitle: "File:Own.png" },
  } satisfies Record<string, ParityReference>,
}));

describe(measureCamera, () => {
  test("gates each reference at its own pose bar where it sets one, else at the camera pass's gate", async () => {
    expect.hasAssertions();

    openWitnessPage.mockResolvedValue({
      checkIsScored: () => false,
      close: () => Promise.resolve(),
      height: 0,
      image: Buffer.alloc(0),
      page: {} as Page,
    });
    solveReferenceCamera.mockResolvedValue({ errors: [], names: [], pose: [], rms: 5 });

    const { readings } = await measureCamera(DerivedAssetComponent.Windrise);

    expect(readings).toStrictEqual([
      { gate: 7.5, name: "own-bar", unit: "px", value: 5 },
      { gate: FRAME_GATE_PIXELS, name: "global-bar", unit: "px", value: 5 },
    ]);
  });
});

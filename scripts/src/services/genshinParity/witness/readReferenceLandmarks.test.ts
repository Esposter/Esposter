import type { Landmark } from "#src/models/genshinAssets/witness/Landmark";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { Page } from "playwright";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readReferenceLandmarks } from "#src/services/genshinParity/witness/readReferenceLandmarks";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { getReferencePath } = vi.hoisted(() => ({
  getReferencePath: vi.fn<(referenceId: string) => Promise<string>>(),
}));

vi.mock(import("#src/services/genshinParity/shared/getReferencePath"), () => ({ getReferencePath }));

// Inazuma's map holds one landmark, keepEaveLeft; houseFrontLeft is named by the reference but waits on a mesh
vi.mock(import("#src/services/genshinAssets/witness/DerivedAssetLandmarkMap"), async (importOriginal) => ({
  DerivedAssetLandmarkMap: {
    ...(await importOriginal()).DerivedAssetLandmarkMap,
    inazuma: {
      keepEaveLeft: { isInterior: true, mesh: "Area_Dq_Build_MS_Tsg_03_Lod0", share: [0, 1, 0.5] },
    } satisfies Record<string, Landmark>,
  },
}));

vi.mock(import("#src/services/genshinParity/shared/ParityReferenceMap"), () => ({
  ParityReferenceMap: {
    "none-held": { landmarks: { houseFrontLeft: [1631, 1145] }, screen: "screen", wikiTitle: "wikiTitle" },
    "one-held": {
      landmarks: { houseFrontLeft: [1631, 1145], keepEaveLeft: [1374, 160] },
      screen: "screen",
      wikiTitle: "wikiTitle",
    },
  } satisfies Record<string, ParityReference>,
}));

describe(readReferenceLandmarks, () => {
  let directory: string;

  beforeEach(async () => {
    directory = mkdtempSync(join(tmpdir(), "parity-landmarks-"));
    const referencePath = join(directory, TEST_FILENAME);
    await sharp({ create: { background: { b: 0, g: 0, r: 0 }, channels: 3, height: 2, width: 2 } })
      .png()
      .toFile(referencePath);
    getReferencePath.mockResolvedValue(referencePath);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("solves on the landmarks the witness holds and names the rest as waiting", async () => {
    expect.hasAssertions();

    const evaluate = vi.fn<(script: unknown, definitions: readonly unknown[]) => Promise<number[][]>>(
      (_script, definitions) => Promise.resolve(definitions.map(() => [0, 0, 0])),
    );
    const { correspondences, names, waiting } = await readReferenceLandmarks(
      { evaluate } as unknown as Page,
      "one-held",
      DerivedAssetComponent.Inazuma,
    );

    expect(names).toStrictEqual(["keepEaveLeft"]);
    expect(waiting).toStrictEqual(["houseFrontLeft"]);
    expect(correspondences.map(({ pixel }) => pixel)).toStrictEqual([[1374, 160]]);
    expect(evaluate).toHaveBeenCalledExactlyOnceWith(expect.anything(), [
      { isInterior: true, mesh: "Area_Dq_Build_MS_Tsg_03_Lod0", share: [0, 1, 0.5] },
    ]);
  });

  test("names every landmark as waiting and solves on none when the witness holds none of them", async () => {
    expect.hasAssertions();

    const evaluate = vi.fn<(script: unknown, definitions: readonly unknown[]) => Promise<number[][]>>();
    const { correspondences, names, waiting } = await readReferenceLandmarks(
      { evaluate } as unknown as Page,
      "none-held",
      DerivedAssetComponent.Inazuma,
    );

    expect(correspondences).toStrictEqual([]);
    expect(names).toStrictEqual([]);
    expect(waiting).toStrictEqual(["houseFrontLeft"]);
    expect(evaluate).not.toHaveBeenCalled();
  });
});

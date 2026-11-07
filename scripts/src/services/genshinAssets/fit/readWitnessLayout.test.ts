import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readWitnessLayout } from "#src/services/genshinAssets/fit/readWitnessLayout";
import { writeStampedFiles } from "#src/services/provenance/writeStampedFiles";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { WITNESS_LAYOUT_FILE_NAME } from "genshin-world/sceneExport";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The extracted folder is a temporary one for the test, so no layout of the repository's parity folder is read
const { EXTRACTED_ROOT } = await vi.hoisted(async () => {
  const { tmpdir } = await import("node:os");
  const { join: joinPath } = await import("node:path");
  return { EXTRACTED_ROOT: joinPath(tmpdir(), "read-witness-layout-test") };
});

const { readGameVersion } = vi.hoisted(() => ({ readGameVersion: vi.fn<() => Promise<string>>() }));

vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({ readGameVersion }));
vi.mock(import("#src/services/genshinAssets/shared/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  EXTRACTED_DIRECTORY: EXTRACTED_ROOT,
}));

describe(readWitnessLayout, () => {
  const INSTALL_VERSION = "a";
  const OTHER_VERSION = "b";
  const LAYOUT = {
    placements: [
      {
        materials: [],
        mesh: "Area_Dq_Rock_Common_Full_M_07_Lod0",
        position: [10, 2, -5],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      },
    ],
  };
  const LAYOUT_PATH = join(EXTRACTED_ROOT, DerivedAssetComponent.Inazuma, WITNESS_LAYOUT_FILE_NAME);

  beforeEach(() => {
    mkdirSync(join(EXTRACTED_ROOT, DerivedAssetComponent.Inazuma), { recursive: true });
    readGameVersion.mockResolvedValue(INSTALL_VERSION);
    writeJsonFile(LAYOUT_PATH, LAYOUT);
  });

  afterEach(() => {
    rmSync(EXTRACTED_ROOT, { force: true, recursive: true });
  });

  test("a witness layout whose sidecar names another game version is refused", async () => {
    expect.hasAssertions();

    readGameVersion.mockResolvedValueOnce(OTHER_VERSION);
    await writeStampedFiles([LAYOUT_PATH], { command: "witness inazuma", producerPaths: [] }, () => {});

    await expect(readWitnessLayout(DerivedAssetComponent.Inazuma)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: witness.json, is stamped with game b, not the install's a]`,
    );
  });

  test("a witness layout with no sidecar stamp is refused", async () => {
    expect.hasAssertions();

    await expect(readWitnessLayout(DerivedAssetComponent.Inazuma)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: witness.json, has no provenance stamp, so its game version is unknown]`,
    );
  });

  test("a witness layout whose sidecar names the install's game version is read", async () => {
    expect.hasAssertions();

    await writeStampedFiles([LAYOUT_PATH], { command: "witness inazuma", producerPaths: [] }, () => {});

    await expect(readWitnessLayout(DerivedAssetComponent.Inazuma)).resolves.toStrictEqual(LAYOUT);
  });
});

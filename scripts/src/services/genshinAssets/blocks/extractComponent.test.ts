import type { exportResolvedAssets as baseExportResolvedAssets } from "#src/services/genshinAssets/blocks/exportResolvedAssets";
import type { readGameVersion as baseReadGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import type { readSceneLayout as baseReadSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import type { parseCabMap as baseParseCabMap } from "#src/services/recreation/animeStudio/parseCabMap";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { EXTRACT_PRODUCER_PATHS } from "#src/services/genshinAssets/blocks/constants";
import { extractComponent } from "#src/services/genshinAssets/blocks/extractComponent";
import { readProvenance } from "#src/services/provenance/readProvenance";
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The AnimeStudio-facing steps are doubles, the rest of an extraction runs on the temporary folders the constants name
const { EXTRACTION_ROOT } = await vi.hoisted(async () => {
  const { tmpdir } = await import("node:os");
  const { join: joinPath } = await import("node:path");
  return { EXTRACTION_ROOT: joinPath(tmpdir(), "extract-component-test") };
});

const { exportResolvedAssets, parseCabMap, readGameVersion, readSceneLayout } = vi.hoisted(() => ({
  exportResolvedAssets: vi.fn<typeof baseExportResolvedAssets>(),
  parseCabMap: vi.fn<typeof baseParseCabMap>(),
  readGameVersion: vi.fn<typeof baseReadGameVersion>(),
  readSceneLayout: vi.fn<typeof baseReadSceneLayout>(),
}));

vi.mock(import("#src/services/genshinAssets/blocks/exportResolvedAssets"), () => ({ exportResolvedAssets }));
vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({ readGameVersion }));
vi.mock(import("#src/services/genshinAssets/shared/readSceneLayout"), () => ({ readSceneLayout }));
vi.mock(import("#src/services/recreation/animeStudio/parseCabMap"), () => ({ parseCabMap }));

vi.mock(import("#src/services/genshinAssets/shared/constants"), async (importOriginal) => {
  const { join: joinPath } = await import("node:path");
  return {
    ...(await importOriginal()),
    ANIMESTUDIO_TOOL: { name: "AnimeStudio", path: joinPath(EXTRACTION_ROOT, "AnimeStudio.CLI") },
    CAB_MAP_PATH: joinPath(EXTRACTION_ROOT, "gi_map.bin"),
    EXTRACTED_DIRECTORY: joinPath(EXTRACTION_ROOT, "extracted"),
  };
});

describe(extractComponent, () => {
  const INSTALL_VERSION = "a";
  const TOOL_CONTENT = "b";
  const COMPONENT = DerivedAssetComponent.Character;
  const EXTRACTED_ROOT = join(EXTRACTION_ROOT, "extracted", COMPONENT);
  const TOOL_PATH = join(EXTRACTION_ROOT, "AnimeStudio.CLI");

  beforeEach(() => {
    rmSync(EXTRACTION_ROOT, { force: true, recursive: true });
    mkdirSync(EXTRACTED_ROOT, { recursive: true });
    writeFileSync(join(EXTRACTION_ROOT, "gi_map.bin"), "");
    writeFileSync(TOOL_PATH, TOOL_CONTENT);
    readGameVersion.mockResolvedValue(INSTALL_VERSION);
    parseCabMap.mockReturnValue(new Map());
    readSceneLayout.mockResolvedValue({ gameObjectDrawingMap: new Map(), objectNameMap: new Map(), objects: [] });
    exportResolvedAssets.mockResolvedValue({ assets: [], unresolved: [] });
  });

  afterEach(() => {
    rmSync(EXTRACTION_ROOT, { force: true, recursive: true });
  });

  test("a written export carries its stamp beside it", async () => {
    expect.hasAssertions();

    await extractComponent(COMPONENT);

    const provenance = await readProvenance(EXTRACTED_ROOT);

    expect(provenance?.command).toBe(`extract ${COMPONENT}`);
    expect(provenance?.gameVersion).toBe(INSTALL_VERSION);
    expect(provenance?.producer.producerPaths).toStrictEqual(EXTRACT_PRODUCER_PATHS);
    expect(provenance?.tools).toStrictEqual([
      { name: "AnimeStudio", sha256: createHash("sha256").update(TOOL_CONTENT).digest("hex") },
    ]);
  });
});

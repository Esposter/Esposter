import type { Provenance } from "#src/models/provenance/Provenance";

import { buildAssetMap } from "#src/services/genshinAssets/blocks/buildAssetMap";
import { placeCabMap } from "#src/services/genshinAssets/blocks/placeCabMap";
import { mapCommand } from "#src/services/genshinAssets/commands/mapCommand";
import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { readFileProvenance } from "#src/services/provenance/readFileProvenance";
import { defineCommand, runCommand } from "citty";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("node:fs"), async (importOriginal) => ({ ...(await importOriginal()), existsSync: () => true }));
vi.mock(import("#src/services/genshinAssets/blocks/adoptCabMap"), () => ({
  adoptCabMap: vi.fn<() => Promise<boolean>>(() => Promise.resolve(false)),
}));
vi.mock(import("#src/services/genshinAssets/blocks/buildAssetMap"), () => ({
  buildAssetMap: vi.fn<(shardCount?: number) => Promise<void>>(() => Promise.resolve()),
}));
vi.mock(import("#src/services/genshinAssets/blocks/placeCabMap"), () => ({
  placeCabMap: vi.fn<() => Promise<void>>(() => Promise.resolve()),
}));
vi.mock(import("#src/services/genshinAssets/blocks/writeAssetIndex"), () => ({
  writeAssetIndex: vi.fn<() => Promise<number>>(() => Promise.resolve(0)),
}));
vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({
  readGameVersion: vi.fn<() => Promise<string>>(() => Promise.resolve("")),
}));
vi.mock(import("#src/services/provenance/readFileProvenance"), () => ({
  readFileProvenance: vi.fn<(file: string) => Promise<Provenance | undefined>>(() => Promise.resolve(undefined)),
}));

const runMap = (rawArgs: string[]) =>
  runCommand(defineCommand({ subCommands: { map: mapCommand } }), { rawArgs: ["map", ...rawArgs] });

describe("mapCommand", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("the map is remade for another game version", async () => {
    expect.hasAssertions();

    const INSTALL_VERSION = "a";
    const STAMPED_VERSION = "b";
    vi.mocked(readGameVersion).mockResolvedValue(INSTALL_VERSION);
    vi.mocked(readFileProvenance).mockResolvedValue({
      command: "",
      gameVersion: STAMPED_VERSION,
      operatingSystem: { platform: "", release: "", version: "" },
      producer: { commit: "", isDirty: false, producerPaths: [] },
      sources: [],
      tools: [],
    });

    await runMap([]);

    expect(buildAssetMap).toHaveBeenCalledExactlyOnceWith(undefined);
    expect(placeCabMap).not.toHaveBeenCalled();
  });
});

import type { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import type { spawnSync as baseSpawnSync } from "@esposter/shared-node/child-process";

import { listFixtureScreens } from "#src/services/genshinParity/fixtures/listFixtureScreens";
import { approveReference } from "#src/services/genshinParity/reference/approveReference";
import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { GENSHIN_WORLD_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getFixtureImageName } from "genshin-interface/constants";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinParity/shared/fetchReferences"), () => ({
  fetchReferences: vi.fn<typeof fetchReferences>(),
}));
vi.mock(import("#src/services/genshinParity/reference/readReferenceManifest"), () => ({
  readReferenceManifest: vi.fn<typeof readReferenceManifest>(),
}));
vi.mock(import("#src/services/genshinParity/fixtures/listFixtureScreens"), () => ({
  listFixtureScreens: vi.fn<typeof listFixtureScreens>(),
}));
const { spawnSync } = vi.hoisted(() => ({ spawnSync: vi.fn<typeof baseSpawnSync>() }));

vi.mock(import("@esposter/shared-node/child-process"), () => ({
  spawnSync: spawnSync as unknown as typeof baseSpawnSync,
}));

describe(approveReference, () => {
  // The reference in ParityReferenceMap whose screen the fixture row names
  const referenceId = "archive-screen";
  const screen = "ArchiveScreen";
  const componentsDirectory = join(GENSHIN_WORLD_DIRECTORY, "src", "components");
  let directory: string;
  let imagePath: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "approve-reference-test-"));
    imagePath = join(directory, `${getFixtureImageName("")}.png`);
    vi.mocked(readReferenceManifest).mockResolvedValue([]);
    // The row's directory is the temporary folder, relative to the components folder the approve resolves it against
    vi.mocked(listFixtureScreens).mockResolvedValue([
      { directory: relative(componentsDirectory, directory), name: screen, variant: "" },
    ] as never);
  });
  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
    vi.resetAllMocks();
  });

  // Each suite run writes the image as its settled frame, as `-u` does, before it exits
  test("puts back the image it found when a run after an earlier written one exits non-zero", async () => {
    expect.hasAssertions();
    writeFileSync(imagePath, "previous");
    vi.mocked(spawnSync)
      .mockImplementationOnce(() => {
        writeFileSync(imagePath, "first");
        return { status: 0 } as never;
      })
      .mockImplementationOnce(() => {
        writeFileSync(imagePath, "second");
        return { status: 1 } as never;
      });

    await expect(approveReference(referenceId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: ArchiveScreen, the visual suite exited 1]`,
    );
    expect(readFileSync(imagePath, "utf8")).toBe("previous");
  });

  test("removes the image a refused approve wrote when there was none before", async () => {
    expect.hasAssertions();
    vi.mocked(spawnSync)
      .mockImplementationOnce(() => {
        writeFileSync(imagePath, "first");
        return { status: 0 } as never;
      })
      .mockImplementationOnce(() => {
        writeFileSync(imagePath, "second");
        return { status: 1 } as never;
      });

    await expect(approveReference(referenceId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: ArchiveScreen, the visual suite exited 1]`,
    );
    expect(existsSync(imagePath)).toBe(false);
  });
});

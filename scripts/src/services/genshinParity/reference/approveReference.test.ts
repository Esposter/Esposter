import type { writeParityScores } from "#src/services/genshinParity/reference/writeParityScores";
import type { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import type { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import type { spawnSync as baseSpawnSync } from "@esposter/shared-node/child-process";

import { ApprovalStatus } from "#src/models/genshinParity/reference/ApprovalStatus";
import { listFixtureScreens } from "#src/services/genshinParity/fixtures/listFixtureScreens";
import { approveReference } from "#src/services/genshinParity/reference/approveReference";
import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { readScore } from "#src/services/genshinParity/reference/readScore";
import { GENSHIN_WORLD_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getFixtureImageName } from "genshin-interface/getFixtureImageName";
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
vi.mock(import("#src/services/genshinParity/reference/readScore"), () => ({ readScore: vi.fn<typeof readScore>() }));
vi.mock(import("#src/services/genshinParity/reference/writeParityScores"), () => ({
  writeParityScores: vi.fn<typeof writeParityScores>(),
}));
vi.mock(import("#src/services/genshinParity/shared/getReferencePath"), () => ({
  getReferencePath: vi.fn<typeof getReferencePath>(),
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

  // A subscreen's image is written whatever its compare scores, and its status against the bar is printed beside it
  const arrangeSubscreen = (meanDifference: number) => {
    vi.mocked(readReferenceManifest).mockResolvedValue([{ id: "character-artifacts" }] as never);
    vi.mocked(listFixtureScreens).mockResolvedValue([
      { directory: relative(componentsDirectory, directory), name: "CharacterScreen", variant: "artifacts" },
    ] as never);
    vi.mocked(readScore).mockResolvedValue({ flip: 0, meanDifference } as never);
    vi.mocked(spawnSync).mockImplementation(() => {
      writeFileSync(join(directory, `${getFixtureImageName("artifacts")}.png`), "render");
      return { status: 0 } as never;
    });
  };

  test("compare clears the bar", async () => {
    expect.hasAssertions();
    arrangeSubscreen(0);
    const log = vi.spyOn(console, "log").mockReturnValue(undefined);

    await approveReference("character-artifacts", "artifacts");

    expect(readFileSync(join(directory, `${getFixtureImageName("artifacts")}.png`), "utf8")).toBe("render");
    expect(log).toHaveBeenCalledWith(expect.stringContaining(ApprovalStatus.WithinBar));
    log.mockRestore();
  });

  test("compare does not clear the bar", async () => {
    expect.hasAssertions();
    arrangeSubscreen(50);
    const log = vi.spyOn(console, "log").mockReturnValue(undefined);

    await approveReference("character-artifacts", "artifacts");

    expect(readFileSync(join(directory, `${getFixtureImageName("artifacts")}.png`), "utf8")).toBe("render");
    expect(log).toHaveBeenCalledWith(expect.stringContaining(ApprovalStatus.OverBar));
    log.mockRestore();
  });
});

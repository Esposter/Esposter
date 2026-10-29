import type { readReferenceFiles as baseReadReferenceFiles } from "#src/services/genshinParity/reference/readReferenceFiles";

import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { getFlatReferenceFilePath } from "#src/services/genshinParity/shared/getFlatReferenceFilePath";
import { getScratchReferencePath } from "#src/services/genshinParity/shared/getScratchReferencePath";
import { mkdir } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { readReferenceFiles } = vi.hoisted(() => ({ readReferenceFiles: vi.fn<typeof baseReadReferenceFiles>() }));

vi.mock(import("node:fs/promises"), async (importOriginal) => ({
  ...(await importOriginal()),
  mkdir: vi.fn<() => Promise<undefined>>(() => Promise.resolve(undefined)),
}));
vi.mock(import("#src/services/genshinParity/reference/readReferenceManifest"), () => ({
  readReferenceManifest: vi.fn<() => Promise<[]>>(() => Promise.resolve([])),
}));
vi.mock(import("#src/services/genshinParity/reference/readReferenceFiles"), () => ({ readReferenceFiles }));

describe(fetchReferences, () => {
  beforeEach(() => {
    vi.mocked(readReferenceManifest).mockClear();
    // One reference with a source and no wiki title, at a path with no file, so it is named missing without any fetch
    readReferenceFiles.mockResolvedValue([
      { id: "-1", path: getFlatReferenceFilePath("-1"), reference: { screen: "ArchiveScreen", source: " " } },
    ]);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("creates the scratch folder before it writes a fetched reference into it", async () => {
    expect.hasAssertions();

    await fetchReferences();

    expect(mkdir).toHaveBeenCalledWith(REFERENCE_SCRATCH_DIRECTORY, { recursive: true });
  });

  test("names a missing reference on stderr and writes nothing to stdout", async () => {
    expect.hasAssertions();

    await fetchReferences();

    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      `-1: no screenshot, sampled from  ; save its cut at ${getScratchReferencePath("-1")} and run genshin:parity references pack`,
    );
  });
});

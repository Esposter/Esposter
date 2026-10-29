import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { mkdir } from "node:fs/promises";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("node:fs/promises"), async (importOriginal) => ({
  ...(await importOriginal()),
  mkdir: vi.fn<() => Promise<undefined>>(() => Promise.resolve(undefined)),
}));
vi.mock(import("#src/services/genshinParity/reference/readReferenceManifest"), () => ({
  readReferenceManifest: vi.fn<() => Promise<[]>>(() => Promise.resolve([])),
}));
vi.mock(import("#src/services/genshinParity/shared/ParityReferenceMap"), () => ({ ParityReferenceMap: {} }));

describe(fetchReferences, () => {
  beforeEach(() => {
    vi.mocked(readReferenceManifest).mockClear();
  });

  test("creates the scratch folder before it writes a fetched reference into it", async () => {
    expect.hasAssertions();

    await fetchReferences();

    expect(mkdir).toHaveBeenCalledWith(REFERENCE_SCRATCH_DIRECTORY, { recursive: true });
  });
});

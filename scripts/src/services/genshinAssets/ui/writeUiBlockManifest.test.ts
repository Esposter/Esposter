import type { UiIndexManifestEntry } from "#src/models/genshinAssets/ui/UiIndexManifestEntry";

import { readUiBlockManifest } from "#src/services/genshinAssets/ui/readUiBlockManifest";
import { writeUiBlockManifest } from "#src/services/genshinAssets/ui/writeUiBlockManifest";
import { rmSync } from "node:fs";
import { afterAll, describe, expect, test, vi } from "vitest";

const { indexDirectory } = await vi.hoisted(async () => {
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  return { indexDirectory: mkdtempSync(join(tmpdir(), "ui-index-")) };
});

vi.mock(import("#src/services/genshinAssets/ui/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  UI_INDEX_DIRECTORY: indexDirectory,
}));

describe(writeUiBlockManifest, () => {
  const BLOCK = "00/04949489.blk";
  const OTHER_BLOCK = "01/04949490.blk";
  const ENTRY: UiIndexManifestEntry = { contentHash: "a".repeat(64), entryCount: 3 };
  const OTHER_ENTRY: UiIndexManifestEntry = { contentHash: "b".repeat(64), entryCount: 5 };

  afterAll(() => {
    rmSync(indexDirectory, { force: true, recursive: true });
  });

  // Two blocks indexed at once each write their own entry, so neither write can take the other's away
  test("keeps each block's entry when two blocks write theirs at once", async () => {
    expect.hasAssertions();

    await Promise.all([writeUiBlockManifest(BLOCK, ENTRY), writeUiBlockManifest(OTHER_BLOCK, OTHER_ENTRY)]);

    await expect(readUiBlockManifest(BLOCK)).resolves.toStrictEqual(ENTRY);
    await expect(readUiBlockManifest(OTHER_BLOCK)).resolves.toStrictEqual(OTHER_ENTRY);
  });
});

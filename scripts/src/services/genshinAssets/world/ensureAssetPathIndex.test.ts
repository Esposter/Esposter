import {
  ASSET_PATH_INDEX_COMMIT,
  ASSET_PATH_INDEX_TIMEOUT_MILLISECONDS,
} from "#src/services/genshinAssets/world/constants";
import { ensureAssetPathIndex } from "#src/services/genshinAssets/world/ensureAssetPathIndex";
import { fetchOk } from "#src/services/shared/fetchOk";
import { publishFile } from "#src/services/shared/publishFile";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/fetchOk"));
vi.mock(import("#src/services/shared/publishFile"));

describe(ensureAssetPathIndex, () => {
  const fixtureIndex = "{}";
  const fixtureSha256 = createHash("sha256").update(fixtureIndex).digest("hex");
  const indexFileName = "gi-2.6.0.json";
  let directory: string;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "asset-index-"));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("returns a held index at its path without fetching it", async () => {
    expect.hasAssertions();

    const indexPath = join(directory, indexFileName);
    await writeFile(indexPath, fixtureIndex);

    await expect(ensureAssetPathIndex(indexPath, fixtureSha256)).resolves.toBe(indexPath);
    expect(vi.mocked(fetchOk)).not.toHaveBeenCalled();
  });

  test("a held index whose SHA-256 differs from its pin is refused", async () => {
    expect.hasAssertions();

    const indexPath = join(directory, indexFileName);
    await writeFile(indexPath, fixtureIndex);

    await expect(ensureAssetPathIndex(indexPath)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: gi-2.6.0.json, has SHA-256 44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a, not the pinned one]`,
    );
    // A held copy is refused, never replaced: the file stays where it is for its owner to remove
    expect(existsSync(indexPath)).toBe(true);
    expect(vi.mocked(fetchOk)).not.toHaveBeenCalled();
  });

  test("a fetched source is pinned to a commit", async () => {
    expect.hasAssertions();

    const indexPath = join(directory, "missing-index.json");
    vi.mocked(fetchOk).mockResolvedValueOnce(new Response(fixtureIndex));

    await expect(ensureAssetPathIndex(indexPath, fixtureSha256)).resolves.toBe(indexPath);
    expect(vi.mocked(fetchOk)).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(ASSET_PATH_INDEX_COMMIT), {
      timeoutMs: ASSET_PATH_INDEX_TIMEOUT_MILLISECONDS,
    });
  });

  test("a fetched source whose SHA-256 differs from its pin is refused", async () => {
    expect.hasAssertions();

    const indexPath = join(directory, "refused-index.json");
    vi.mocked(fetchOk).mockResolvedValueOnce(new Response(fixtureIndex));

    await expect(ensureAssetPathIndex(indexPath)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://raw.githubusercontent.com/radioegor146/gi-asset-indexes/3192b1759a6d1f6879cc348ad92e078092c1fb9f/mapped/GenshinImpact_2.6.0.zip_31049740.blk.asset_index.json, has SHA-256 44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a, not the pinned one]`,
    );
    expect(vi.mocked(publishFile)).not.toHaveBeenCalled();
  });
});

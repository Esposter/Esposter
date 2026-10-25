import type { Database } from "@esposter/db-schema";

import { checkIsResourceAssetReadable } from "#server/services/resource/checkIsResourceAssetReadable";
import { SnapshotChannel } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

describe(checkIsResourceAssetReadable, () => {
  const resourceId = crypto.randomUUID();
  const hash = "a".repeat(64);
  const publishVersion = 1;
  // The one row that answers the per-asset question: the published version's row naming this hash
  const createDatabase = (isPublishedAsset: boolean) => {
    const findFirstPublishedAsset = vi.fn<() => Promise<undefined | { assetHash: string }>>(() =>
      Promise.resolve(isPublishedAsset ? { assetHash: hash } : undefined),
    );
    return {
      db: { query: { resourceVersionAssetsInResource: { findFirst: findFirstPublishedAsset } } } as unknown as Database,
      findFirstPublishedAsset,
    };
  };

  test("published asset is readable while the current publication names it", async () => {
    expect.hasAssertions();

    const { db, findFirstPublishedAsset } = createDatabase(true);

    await expect(
      checkIsResourceAssetReadable(db, { hash, resourceId }, { isOwned: false, publishVersion }),
    ).resolves.toBe(true);
    expect(findFirstPublishedAsset).toHaveBeenCalledExactlyOnceWith({
      where: {
        assetHash: { eq: hash },
        channel: { eq: SnapshotChannel.Published },
        resourceId: { eq: resourceId },
        version: { eq: publishVersion },
      },
    });
  });

  // Unpublishing drops the publication row, so a resource with no current publication answers no asset to a stranger
  // Without the per-asset lookup being issued at all
  test("refuses a stranger's asset when the resource has no current publication, without a lookup", async () => {
    expect.hasAssertions();

    const { db, findFirstPublishedAsset } = createDatabase(true);

    await expect(checkIsResourceAssetReadable(db, { hash, resourceId }, { isOwned: false })).resolves.toBe(false);
    expect(findFirstPublishedAsset).not.toHaveBeenCalled();
  });

  test("a working-only image is not public", async () => {
    expect.hasAssertions();

    const { db } = createDatabase(false);

    await expect(
      checkIsResourceAssetReadable(db, { hash, resourceId }, { isOwned: false, publishVersion }),
    ).resolves.toBe(false);
  });

  test("reads any asset of a resource the caller owns, without a lookup", async () => {
    expect.hasAssertions();

    const { db, findFirstPublishedAsset } = createDatabase(false);

    await expect(checkIsResourceAssetReadable(db, { hash, resourceId }, { isOwned: true })).resolves.toBe(true);
    expect(findFirstPublishedAsset).not.toHaveBeenCalled();
  });
});

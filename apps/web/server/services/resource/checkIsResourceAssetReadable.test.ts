import type { Database } from "@esposter/db-schema";

import { checkIsResourceAssetReadable } from "#server/services/resource/checkIsResourceAssetReadable";
import { SnapshotChannel } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

describe(checkIsResourceAssetReadable, () => {
  const resourceId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const hash = "a".repeat(64);
  const publishVersion = 1;
  // The three rows that answer the question, each present or absent: an owned, undeleted resource row for a working
  // Copy, a publication row, and the published version's row naming this hash
  const createDatabase = ({
    isOwnedResource,
    isPublication,
    isPublishedAsset,
  }: {
    isOwnedResource: boolean;
    isPublication: boolean;
    isPublishedAsset: boolean;
  }) => {
    const findFirstResource = vi.fn<() => Promise<undefined | { id: string }>>(() =>
      Promise.resolve(isOwnedResource ? { id: resourceId } : undefined),
    );
    const findFirstPublication = vi.fn<() => Promise<undefined | { publishVersion: number; resourceId: string }>>(() =>
      Promise.resolve(isPublication ? { publishVersion, resourceId } : undefined),
    );
    const findFirstPublishedAsset = vi.fn<() => Promise<undefined | { assetHash: string }>>(() =>
      Promise.resolve(isPublishedAsset ? { assetHash: hash } : undefined),
    );
    return {
      db: {
        query: {
          resourcePublicationsInResource: { findFirst: findFirstPublication },
          resourcesInResource: { findFirst: findFirstResource },
          resourceVersionAssetsInResource: { findFirst: findFirstPublishedAsset },
        },
      } as unknown as Database,
      findFirstPublication,
      findFirstPublishedAsset,
      findFirstResource,
    };
  };

  test("published asset is readable while the current publication names it", async () => {
    expect.hasAssertions();

    const { db, findFirstPublishedAsset, findFirstResource } = createDatabase({
      isOwnedResource: false,
      isPublication: true,
      isPublishedAsset: true,
    });

    await expect(checkIsResourceAssetReadable(db, { hash, resourceId })).resolves.toBe(true);
    expect(findFirstPublishedAsset).toHaveBeenCalledExactlyOnceWith({
      where: {
        assetHash: { eq: hash },
        channel: { eq: SnapshotChannel.Published },
        resourceId: { eq: resourceId },
        version: { eq: publishVersion },
      },
    });
    expect(findFirstResource).not.toHaveBeenCalled();
  });

  // Unpublishing drops the publication row, so a url minted while the snapshot was live stops answering to anyone but its
  // Owner, which is why the row is read per request rather than cached
  test("refuses a published asset whose publication row is gone to an anonymous caller", async () => {
    expect.hasAssertions();

    const { db, findFirstPublishedAsset } = createDatabase({
      isOwnedResource: false,
      isPublication: false,
      isPublishedAsset: true,
    });

    await expect(checkIsResourceAssetReadable(db, { hash, resourceId })).resolves.toBe(false);
    expect(findFirstPublishedAsset).not.toHaveBeenCalled();
  });

  test("a working-only image is not public", async () => {
    expect.hasAssertions();

    const { db } = createDatabase({ isOwnedResource: true, isPublication: true, isPublishedAsset: false });

    await expect(checkIsResourceAssetReadable(db, { hash, resourceId })).resolves.toBe(false);
  });

  test("reads any asset of a resource the caller owns", async () => {
    expect.hasAssertions();

    const { db, findFirstPublication } = createDatabase({
      isOwnedResource: true,
      isPublication: false,
      isPublishedAsset: false,
    });

    await expect(checkIsResourceAssetReadable(db, { hash, resourceId }, userId)).resolves.toBe(true);
    expect(findFirstPublication).not.toHaveBeenCalled();
  });

  test("refuses a working-copy asset the caller does not own", async () => {
    expect.hasAssertions();

    const { db } = createDatabase({ isOwnedResource: false, isPublication: false, isPublishedAsset: false });

    await expect(checkIsResourceAssetReadable(db, { hash, resourceId }, userId)).resolves.toBe(false);
  });

  test("reads a published asset to a non-owner while the current publication names it", async () => {
    expect.hasAssertions();

    const { db } = createDatabase({ isOwnedResource: false, isPublication: true, isPublishedAsset: true });

    await expect(checkIsResourceAssetReadable(db, { hash, resourceId }, userId)).resolves.toBe(true);
  });

  // The serving endpoint is public, so an anonymous caller reaches here with no user id at all. Nothing can own a resource
  // On their behalf, so the ownership query is never worth issuing
  test("refuses a working-copy asset to an anonymous caller without querying for ownership", async () => {
    expect.hasAssertions();

    const { db, findFirstResource } = createDatabase({
      isOwnedResource: true,
      isPublication: false,
      isPublishedAsset: false,
    });

    await expect(checkIsResourceAssetReadable(db, { hash, resourceId })).resolves.toBe(false);
    expect(findFirstResource).not.toHaveBeenCalled();
  });

  // A deleted resource is restorable, so its row survives the delete: the filter is the only thing stopping its
  // Assets from serving out of the recycle bin
  test("excludes a soft-deleted resource from the ownership lookup", async () => {
    expect.hasAssertions();

    const { db, findFirstResource } = createDatabase({
      isOwnedResource: true,
      isPublication: false,
      isPublishedAsset: false,
    });
    await checkIsResourceAssetReadable(db, { hash, resourceId }, userId);

    expect(findFirstResource).toHaveBeenCalledExactlyOnceWith({
      where: { deletedAt: { isNull: true }, id: { eq: resourceId }, userId: { eq: userId } },
    });
  });
});

import type { Database } from "@esposter/db-schema";

import { checkIsResourceAssetReadable } from "@@/server/services/resource/checkIsResourceAssetReadable";
import { describe, expect, test, vi } from "vitest";

describe(checkIsResourceAssetReadable, () => {
  const resourceId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  // The two rows that answer the question, each present or absent — a publication row makes a published asset
  // Anonymous-capable, and an owned, undeleted resource row is what a working copy falls back to
  const createDatabase = (isPublication: boolean, isOwnedResource: boolean) => {
    const findFirstPublication = vi.fn<() => Promise<undefined | { resourceId: string }>>(() =>
      Promise.resolve(isPublication ? { resourceId } : undefined),
    );
    const findFirstResource = vi.fn<() => Promise<undefined | { id: string }>>(() =>
      Promise.resolve(isOwnedResource ? { id: resourceId } : undefined),
    );
    return {
      db: {
        query: {
          resourcePublications: { findFirst: findFirstPublication },
          resources: { findFirst: findFirstResource },
        },
      } as unknown as Database,
      findFirstPublication,
      findFirstResource,
    };
  };

  test("reads a published asset while its publication row exists", async () => {
    expect.hasAssertions();

    const { db, findFirstPublication, findFirstResource } = createDatabase(true, false);

    await expect(checkIsResourceAssetReadable(db, { isPublished: true, resourceId })).resolves.toBe(true);
    expect(findFirstPublication).toHaveBeenCalledWith({ where: { resourceId: { eq: resourceId } } });
    expect(findFirstResource).not.toHaveBeenCalled();
  });

  // Unpublishing drops the row, so a url minted while the snapshot was live stops answering to anyone but its
  // Owner — which is the whole reason the row is read per request rather than cached
  test("falls back to ownership for a published asset whose publication row is gone", async () => {
    expect.hasAssertions();

    const { db } = createDatabase(false, true);

    await expect(checkIsResourceAssetReadable(db, { isPublished: true, resourceId }, userId)).resolves.toBe(true);
  });

  test("refuses a published asset whose publication row is gone to a non-owner", async () => {
    expect.hasAssertions();

    const { db } = createDatabase(false, false);

    await expect(checkIsResourceAssetReadable(db, { isPublished: true, resourceId }, userId)).resolves.toBe(false);
  });

  test("refuses a published asset whose publication row is gone to an anonymous caller", async () => {
    expect.hasAssertions();

    const { db, findFirstResource } = createDatabase(false, true);

    await expect(checkIsResourceAssetReadable(db, { isPublished: true, resourceId })).resolves.toBe(false);
    expect(findFirstResource).not.toHaveBeenCalled();
  });

  test("reads a working copy owned by the caller", async () => {
    expect.hasAssertions();

    const { db } = createDatabase(false, true);

    await expect(checkIsResourceAssetReadable(db, { isPublished: false, resourceId }, userId)).resolves.toBe(true);
  });

  test("refuses a working copy the caller does not own", async () => {
    expect.hasAssertions();

    const { db } = createDatabase(false, false);

    await expect(checkIsResourceAssetReadable(db, { isPublished: false, resourceId }, userId)).resolves.toBe(false);
  });

  // The serving endpoint is public, so an anonymous caller reaches here with no user id at all. Nothing can own
  // A resource on their behalf, so the ownership query is never worth issuing
  test("refuses a working copy to an anonymous caller without querying for ownership", async () => {
    expect.hasAssertions();

    const { db, findFirstResource } = createDatabase(false, false);

    await expect(checkIsResourceAssetReadable(db, { isPublished: false, resourceId })).resolves.toBe(false);
    expect(findFirstResource).not.toHaveBeenCalled();
  });

  // A deleted resource is restorable, so its row survives the delete — the filter is the only thing stopping its
  // Assets from serving out of the recycle bin
  test("excludes a soft-deleted resource from the ownership lookup", async () => {
    expect.hasAssertions();

    const { db, findFirstResource } = createDatabase(false, true);
    await checkIsResourceAssetReadable(db, { isPublished: false, resourceId }, userId);

    expect(findFirstResource).toHaveBeenCalledWith({
      where: { deletedAt: { isNull: true }, id: { eq: resourceId }, userId: { eq: userId } },
    });
  });
});
